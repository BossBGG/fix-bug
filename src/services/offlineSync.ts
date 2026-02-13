import { indexedDBService, WorkOrderOfflineData, MaterialEquipmentOfflineData, SurveyOfflineData, SurveyImageOfflineData, ExecutionImageOfflineData, ExecutionAttachmentOfflineData } from '@/lib/indexedDB';
import { DraftWorkOrder, DraftWorkOrderOffline, updateWorkOrder, executeWorkOrder, cancelWorkOrder, completeWorkBulk, completeWorkByWorkOrderNo, uploadWorkOrderExecutionImage, uploadWorkOrderExecutionAttachment, getServiceRequestDetail, getWorkOrderDetailById, CreateBulkWorkOrder } from '@/app/api/WorkOrderApi';
import { createDataMaterials, updateDataMaterials, deleteMaterialEquipment, updateActiveStatusMaterial } from '@/app/api/MaterialEquipmentApi';
import { updateWorkOrderSurvey, uploadWorkOrderSurveyImage } from '@/app/api/WorkOrderSurveyApi';
import { base64ToFile, isOfflineImageId } from '@/components/offline/OfflineSurveyImageUpload';
import { isOfflineExecutionImageId } from '@/components/offline/OfflineExecutionImageUpload';
import { isOfflineExecutionAttachmentId } from '@/components/offline/OfflineExecutionAttachmentUpload';
import {CustomerRequest, WorkOrderObj} from '@/types';

type SyncCallback = (status: 'syncing' | 'synced' | 'error', count?: number) => void;
type SyncCompletionCallback = (entityType: 'workOrder' | 'materialEquipment' | 'survey', successCount: number) => void;

class OfflineSyncService {
  private isOnline: boolean;
  private syncInProgress: boolean = false;
  private syncCallbacks: Set<SyncCallback> = new Set();
  private syncCompletionCallbacks: Set<SyncCompletionCallback> = new Set();
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.isOnline = this.initializeOnlineStatus();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  private initializeOnlineStatus(): boolean {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const storedStatus = localStorage.getItem('pea_offline_mode');
      if (storedStatus === 'true') {
        console.log('🔴 Restoring offline state from localStorage');
        return false;
      }
    }
    const status = typeof navigator !== 'undefined' ? navigator.onLine : true;
    console.log(`📡 Initialized online status: ${status}`);
    return status;
  }

  private handleOnline() {
    this.isOnline = true;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('pea_offline_mode');
    }
    console.log('🟢 Network online - starting sync...');
    this.syncPendingExecutionImages();
    this.syncPendingExecutionAttachments();
    this.syncPendingWorkOrders();
    this.syncPendingMaterialEquipments();
    this.syncPendingSurveyImages().then(() => {
      this.syncPendingSurveys();
    });
  }

  private handleOffline() {
    this.isOnline = false;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pea_offline_mode', 'true');
    }
    console.log('🔴 Network offline');
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public addSyncCallback(callback: SyncCallback) {
    this.syncCallbacks.add(callback);
  }

  public removeSyncCallback(callback: SyncCallback) {
    this.syncCallbacks.delete(callback);
  }

  public addSyncCompletionCallback(callback: SyncCompletionCallback) {
    this.syncCompletionCallbacks.add(callback);
  }

  public removeSyncCompletionCallback(callback: SyncCompletionCallback) {
    this.syncCompletionCallbacks.delete(callback);
  }

  private notifyCallbacks(status: 'syncing' | 'synced' | 'error', count?: number) {
    this.syncCallbacks.forEach(callback => callback(status, count));
  }

  private notifySyncCompletion(entityType: 'workOrder' | 'materialEquipment' | 'survey', successCount: number) {
    if (successCount > 0) {
      console.log(`📢 Notifying sync completion: ${entityType}, ${successCount} items synced`);
      this.syncCompletionCallbacks.forEach(callback => callback(entityType, successCount));
    }
  }

  public async saveWorkOrderOffline(
    data: any,
    action: 'create' | 'update' = 'create',
    customId?: string,
  ): Promise<string> {
    let id: string;

    if (action === 'update' && customId) {
      // For update actions, generate a new unique ID but preserve the workOrderId reference in data
      // This prevents overwriting the original create record
      id = `offline-update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      // Store the original workOrderId in the data so sync can use it
      data = { ...data, id: customId };
      console.log(`💾 Work order update saved with new ID: ${id}, referencing workOrderId: ${customId}`);
    } else {
      id = customId || `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    await indexedDBService.saveWorkOrder(id, data, action);

    if (this.isOnline) {
      this.syncPendingWorkOrders();
    }

    return id;
  }

  public async saveCancelWorkOrderOffline(
    workOrderId: string,
    cancelData: { note: string }
  ): Promise<string> {
    const id = `offline-cancel-${workOrderId}-${Date.now()}`;

    await indexedDBService.saveWorkOrder(id, { workOrderId, ...cancelData }, 'cancel');

    console.log(`💾 Work order cancellation saved offline: ${id}`);

    if (this.isOnline) {
      this.syncPendingWorkOrders();
    }

    return id;
  }

  public async saveCompleteWorkOrderOffline(
    workOrderNos: string[],
    isBulk: boolean = false
  ): Promise<string> {
    const action = isBulk ? 'complete_bulk' : 'complete_single';
    const id = `offline-complete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await indexedDBService.saveWorkOrder(id, { workOrderNos }, action);

    console.log(`💾 Work order completion saved offline: ${id} (${action})`);

    if (this.isOnline) {
      this.syncPendingWorkOrders();
    }

    return id;
  }

  public async saveWorkOrderStatusOffline(
    workOrderId: string,
    status: string
  ): Promise<string> {
    const id = `offline-status-${workOrderId}-${Date.now()}`;

    await indexedDBService.saveWorkOrder(id, { workOrderId, status }, 'update_status');

    console.log(`💾 Work order status update saved offline: ${id} (status: ${status})`);

    if (this.isOnline) {
      this.syncPendingWorkOrders();
    }

    return id;
  }

  public async syncPendingWorkOrders(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    this.notifyCallbacks('syncing');

    try {
      const pendingWorkOrders = await indexedDBService.getAllPendingWorkOrders();

      if (pendingWorkOrders.length === 0) {
        this.syncInProgress = false;
        this.notifyCallbacks('synced', 0);
        return;
      }

      console.log(`🔄 Syncing ${pendingWorkOrders.length} pending work orders...`);

      // Group work orders by base offline workOrderId for create+update sequence handling
      const offlineWorkOrderGroups = new Map<string, WorkOrderOfflineData[]>();
      const standaloneWorkOrders: WorkOrderOfflineData[] = [];

      for (const workOrder of pendingWorkOrders) {
        // Extract base offline workOrderId from data (for update actions that reference offline-created work orders)
        const dataWorkOrderId = workOrder.data?.id || workOrder.data?.workOrderId;
        const isOfflineBasedUpdate = workOrder.action === 'update' &&
          typeof dataWorkOrderId === 'string' &&
          dataWorkOrderId.startsWith('offline-');

        const isOfflineCreate = workOrder.action === 'create' &&
          workOrder.id.startsWith('offline-');

        if (isOfflineCreate || isOfflineBasedUpdate) {
          // Get the base offline ID
          const baseOfflineId = isOfflineCreate ? workOrder.id : dataWorkOrderId;

          if (!offlineWorkOrderGroups.has(baseOfflineId)) {
            offlineWorkOrderGroups.set(baseOfflineId, []);
          }
          offlineWorkOrderGroups.get(baseOfflineId)!.push(workOrder);
        } else {
          standaloneWorkOrders.push(workOrder);
        }
      }

      let successCount = 0;
      let failCount = 0;

      console.log('offlineWorkOrderGroups >>>> ', offlineWorkOrderGroups, offlineWorkOrderGroups.size)

      // Process grouped offline work orders (create before update)
      for (const [baseOfflineId, group] of offlineWorkOrderGroups) {
        // Sort: create first, then update (by timestamp)
        group.sort((a, b) => {
          if (a.action === 'create' && b.action !== 'create') return -1;
          if (a.action !== 'create' && b.action === 'create') return 1;
          return a.timestamp - b.timestamp;
        });

        let realWorkOrderId: string | undefined;
        let capturedCustomerRequestNo: string | undefined;
        let customerRequestData: CustomerRequest | null = null;
        let workOrderDetailData: WorkOrderObj | null = null;

        // Check if group has both create and update actions with customerRequestNo
        const hasCreateAction = group.some(wo => wo.action === 'create');
        const hasUpdateAction = group.some(wo => wo.action === 'update');
        const draftWorkOrder = group.find(wo => wo.action === 'create');
        const customerRequestNo = draftWorkOrder?.data?.customerRequestNo;
        const workOrderParentId = draftWorkOrder?.data?.workOrderParentId;

        console.log('hasCreateAction >>>> ', hasCreateAction)
        console.log('hasUpdateAction >>> ', hasUpdateAction)
        console.log('draftWorkOrder >>> ', draftWorkOrder)
        console.log('customerRequestNo >>>> ', customerRequestNo)
        console.log('workOrderParentId >>>> ', workOrderParentId)

        if (hasCreateAction && hasUpdateAction && customerRequestNo) {
          try {
            console.log(`🔄 Fetching customer request details for: ${customerRequestNo}`);
            const resCustReq = await getServiceRequestDetail(customerRequestNo);

            if (resCustReq.status === 200) {
              const customerItem: CustomerRequest[] = resCustReq.data?.data?.data || [];
              if (customerItem.length > 0) {
                customerRequestData = customerItem[0];
                console.log(`✅ Retrieved customer request data for: ${customerRequestNo}`);
              }
            }
          } catch (error) {
            console.error(`Failed to fetch customer request details for ${customerRequestNo}:`, error);
          }
        }

        // Check if group has both create and update actions with workOrderParentId
        if (hasCreateAction && hasUpdateAction && workOrderParentId) {
          try {
            console.log(`🔄 Fetching work order details for parent ID: ${workOrderParentId}`);
            const resWorkOrderDetail = await getWorkOrderDetailById(workOrderParentId, false);

            if (resWorkOrderDetail.status === 200) {
              workOrderDetailData = resWorkOrderDetail.data?.data as WorkOrderObj;
              if (workOrderDetailData) {
                console.log(`✅ Retrieved work order detail data for parent ID: ${workOrderParentId}`);
              }
            }
          } catch (error) {
            console.error(`Failed to fetch work order details for parent ID ${workOrderParentId}:`, error);
          }
        }

        console.log('group <<<<<< ', group, group.length)
        for (const workOrder of group) {
          try {
            const result = await this.syncSingleWorkOrder(workOrder, realWorkOrderId, capturedCustomerRequestNo, customerRequestData, workOrderDetailData);
            console.log('result >>>> ', result)

            // If this was a create action, capture the real ID and customerRequestNo for subsequent updates
            if (workOrder.action === 'create' && result?.realWorkOrderId) {
              realWorkOrderId = result.realWorkOrderId;
              capturedCustomerRequestNo = result.customerRequestNo;
              console.log(`📝 Captured real workOrderId: ${realWorkOrderId} for offline ID: ${baseOfflineId}`);
              if (capturedCustomerRequestNo) {
                console.log(`📝 Captured customerRequestNo: ${capturedCustomerRequestNo} from create response`);
              }
            }

            successCount++;
          } catch (error) {
            console.error(`Failed to sync work order ${workOrder.id}:`, error);
            failCount++;

            await indexedDBService.updateWorkOrderStatus(
              workOrder.id,
              'failed',
              error instanceof Error ? error.message : 'Unknown error'
            );
          }
        }
      }

      // Process standalone work orders
      for (const workOrder of standaloneWorkOrders) {
        try {
          await this.syncSingleWorkOrder(workOrder);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync work order ${workOrder.id}:`, error);
          failCount++;

          await indexedDBService.updateWorkOrderStatus(
            workOrder.id,
            'failed',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      console.log(`✅ Sync completed: ${successCount} success, ${failCount} failed`);

      this.notifyCallbacks('synced', successCount);
      this.notifySyncCompletion('workOrder', successCount);

      if (failCount > 0) {
        this.scheduleRetry();
      }

    } catch (error) {
      console.error('Sync error:', error);
      this.notifyCallbacks('error');
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncSingleWorkOrder(
    workOrder: WorkOrderOfflineData,
    realWorkOrderIdFromCreate?: string,
    customerRequestNo?: string,
    customerRequestData?: CustomerRequest | null,
    workOrderDetailData?: WorkOrderObj | null
  ): Promise<{ realWorkOrderId?: string; customerRequestNo?: string } | void> {
    const MAX_RETRY_COUNT = 3;

    if (workOrder.retryCount >= MAX_RETRY_COUNT) {
      console.warn(`Max retry count reached for work order ${workOrder.id}`);
      throw new Error('Max retry count exceeded');
    }

    let response;
    let createdWorkOrderId: string | undefined;

    if (workOrder.action === 'create') {
      const createType = workOrder.data.workOrderType || 'single';

      if (createType === 'bulk') {
        // Handle bulk work order creation
        const bulkData = {
          bulkType: workOrder.data.bulkType || 'no_reference',
          selectedPeaOffices: workOrder.data.selectedPeaOffices || [],
          mainWorkOrder: {
            serviceId: workOrder.data.serviceId,
          },
          ...(workOrder.data.customerRequestNo && { customerRequestNo: workOrder.data.customerRequestNo }),
          ...(workOrder.data.workOrderParentId && { existingParentWorkOrderId: workOrder.data.workOrderParentId }),
        };

        console.log(`🔄 Creating bulk work order with data:`, bulkData);
        response = await CreateBulkWorkOrder(bulkData);

        // Capture the real workOrderId from bulk creation response
        if (response.status === 200 || response.status === 201) {
          // For bulk creation, the main work order ID is in mainWorkOrder.id or results[0].id
          const responseData = response?.data?.data;
          createdWorkOrderId = responseData?.mainWorkOrder?.id || responseData?.results?.[0]?.id || responseData?.id;
          if (createdWorkOrderId) {
            console.log(`📝 Created bulk work order with real ID: ${createdWorkOrderId}`);
          }
          const responseCustomerRequestNo = responseData?.customerRequestNo || customerRequestNo;
          if (responseCustomerRequestNo) {
            console.log(`📝 Captured customerRequestNo from bulk create response: ${responseCustomerRequestNo} or ${customerRequestNo}`);
          }
        }
      } else {
        // Handle single work order creation (existing logic)
        response = await DraftWorkOrder(workOrder.data);
        // Capture the real workOrderId and customerRequestNo from the creation response
        if (response.status === 200 || response.status === 201) {
          createdWorkOrderId = response?.data?.data?.id
          if (createdWorkOrderId) {
            console.log(`📝 Created work order with real ID: ${createdWorkOrderId}`);
          }
          // Also capture customerRequestNo from response
          const responseCustomerRequestNo = response?.data?.data?.customerRequestNo;
          if (responseCustomerRequestNo) {
            console.log(`📝 Captured customerRequestNo from create response: ${responseCustomerRequestNo}`);
          }
        }
      }
    } else if (workOrder.action === 'cancel') {
      const workOrderId = workOrder.data.workOrderId;
      const { note } = workOrder.data;
      response = await cancelWorkOrder(workOrderId, { note });
    } else if (workOrder.action === 'complete_single') {
      const { workOrderNos } = workOrder.data;
      response = await completeWorkByWorkOrderNo(workOrderNos[0]);
    } else if (workOrder.action === 'complete_bulk') {
      const { workOrderNos } = workOrder.data;
      response = await completeWorkBulk(workOrderNos);
    } else if (workOrder.action === 'update_status') {
      const { workOrderId, status } = workOrder.data;
      const { updateWorkOrderStatus } = await import('@/app/api/WorkOrderApi');
      response = await updateWorkOrderStatus(workOrderId, status);
    } else {
      // For update action: use realWorkOrderIdFromCreate if available, otherwise fallback to existing logic
      let workOrderId = workOrder.data.id || workOrder.id.replace('offline-', '');

      // If this update is for an offline-created work order and we have the real ID from create response
      if (realWorkOrderIdFromCreate &&
          (workOrderId.startsWith('offline-') || workOrder.data?.id?.startsWith('offline-'))) {
        console.log(`🔄 Using real workOrderId ${realWorkOrderIdFromCreate} instead of offline ID ${workOrderId} for update`);
        workOrderId = realWorkOrderIdFromCreate;
      }

      const workOrderStatusCode = workOrder.data.workOrderStatusCode;

      // Handle offline execution images and attachments
      let workOrderData = { ...workOrder.data };

      // Ensure customerRequestNo is included in update data
      if (customerRequestNo && !workOrderData.customerRequestNo) {
        workOrderData.customerRequestNo = customerRequestNo;
        console.log(`📝 Added customerRequestNo from create response to update data: ${customerRequestNo}`);
      }

      // Merge customer request data if available (similar to page.tsx lines 481-515)
      if (customerRequestData && workOrder.action === 'update') {
        console.log(`📝 Merging customer request data into work order update`);
        workOrderData = {
          ...workOrderData,
          customerRequestNo: workOrderData.customerRequestNo || workOrder.data?.customerRequestNo || "",
          sapOrderNo:
            customerRequestData?.sapOrderNo ||
            workOrder.data?.sapOrderNo ||
            "",
          serviceName: customerRequestData?.serviceName || "",
          customerName: customerRequestData?.customerName || "",
          customerMobileNo: customerRequestData.customerMobileNo || "",
          customerAddress: customerRequestData.customerAddress || "",
          customerEmail: customerRequestData.customerEmail || "",
          customerBp: customerRequestData.customerBp || "",
          customerCa: customerRequestData.customerCa || "",
          customerLatitude: customerRequestData.customerLatitude || 0,
          customerLongitude: customerRequestData.customerLongitude || 0,
          sapProcessCreatedDate:
            customerRequestData.sapProcessCreatedDate || undefined,
        };
        console.log(`✅ Customer request data merged successfully`);
      }

      // Merge work order detail data if available (for workOrderParentId case, similar to page.tsx lines 539-676)
      if (workOrderDetailData && workOrder.action === 'update') {
        console.log(`📝 Merging work order detail data into work order update for parent reference`);
        workOrderData = {
          ...workOrderData,
          peaOffice: workOrder.data?.peaOffice || workOrderDetailData?.peaOffice || "",
          officePlant: workOrder.data?.officePlant || workOrderDetailData?.officePlant || "",
          costCenter: workOrder.data?.costCenter || workOrderDetailData?.costCenter || "",
          priority: workOrder.data?.priority || workOrderDetailData?.priority || 2,
          sapOrderNo: workOrder.data?.sapOrderNo || workOrderDetailData?.sapOrderNo || "",
          sapProcessCreatedDate: workOrder.data?.sapProcessCreatedDate || workOrderDetailData?.sapProcessCreatedDate || undefined,
          serviceName: workOrder.data?.serviceName || workOrderDetailData?.serviceName || "",
          customerName: workOrder.data?.customerName || workOrderDetailData?.customerName || "",
          customerMobileNo: workOrder.data?.customerMobileNo || workOrderDetailData?.customerMobileNo || "",
          customerAddress: workOrder.data?.customerAddress || workOrderDetailData?.customerAddress || "",
          customerEmail: workOrder.data?.customerEmail || workOrderDetailData?.customerEmail || "",
          customerBp: workOrder.data?.customerBp || workOrderDetailData?.customerBp || "",
          customerCa: workOrder.data?.customerCa || workOrderDetailData?.customerCa || "",
          customerLatitude: workOrder.data?.customerLatitude || workOrderDetailData?.customerLatitude || 0,
          customerLongitude: workOrder.data?.customerLongitude || workOrderDetailData?.customerLongitude || 0,
          recorderName: workOrder.data?.recorderName || workOrderDetailData?.execution?.recorderName || "",
          recorderPosition: workOrder.data?.recorderPosition || workOrderDetailData?.execution?.recorderPosition || "",
          recorderPhoneNumber: workOrder.data?.recorderPhoneNumber || workOrderDetailData?.execution?.recorderPhoneNumber || "",
          serviceSpecificData: workOrder.data?.serviceSpecificData || workOrderDetailData?.serviceSpecificData || undefined,
          assignees: workOrder.data?.assignees?.length > 0
            ? workOrder.data.assignees
            : workOrderDetailData?.assignees?.length > 0
              ? workOrderDetailData.assignees
              : [],
          participants: workOrder.data?.participants || workOrderDetailData?.participants || [],
          activityPmId: workOrder.data?.activityPmId || workOrderDetailData?.activityPmId || undefined,
        };
        console.log(`✅ Work order detail data merged successfully for parent reference`);
      }

      if (workOrderStatusCode && workOrderStatusCode !== 'W') {
        // For execution, check if there are offline images or attachments
        if (workOrderData.images && Array.isArray(workOrderData.images)) {
          const hasOfflineImages = workOrderData.images.some((id: number | string) => isOfflineExecutionImageId(id));

          if (hasOfflineImages) {
            console.log(`🔄 Work order ${workOrder.id} has offline execution images, syncing them first...`);
            const imageIdMapping = await this.syncPendingExecutionImages();
            const existingImageMapping = await this.getExecutionImageIdMapping();
            const combinedImageMapping = new Map([...existingImageMapping, ...imageIdMapping]);

            workOrderData.images = await this.replaceOfflineExecutionImageIds(workOrderData.images, combinedImageMapping);
            console.log(`📝 Replaced offline execution image IDs with server IDs:`, workOrderData.images);
          }
        }

        if (workOrderData.attachments && Array.isArray(workOrderData.attachments)) {
          const hasOfflineAttachments = workOrderData.attachments.some((id: number | string) => isOfflineExecutionAttachmentId(id));

          if (hasOfflineAttachments) {
            console.log(`🔄 Work order ${workOrder.id} has offline execution attachments, syncing them first...`);
            const attachmentIdMapping = await this.syncPendingExecutionAttachments();
            const existingAttachmentMapping = await this.getExecutionAttachmentIdMapping();
            const combinedAttachmentMapping = new Map([...existingAttachmentMapping, ...attachmentIdMapping]);

            workOrderData.attachments = await this.replaceOfflineExecutionAttachmentIds(workOrderData.attachments, combinedAttachmentMapping);
            console.log(`📝 Replaced offline execution attachment IDs with server IDs:`, workOrderData.attachments);
          }
        }

        response = await executeWorkOrder(workOrderId, workOrderData);
      } else {
        response = await updateWorkOrder(workOrderId, workOrderData);
      }
    }

    if (response.status === 200 || response.status === 201) {
      await indexedDBService.updateWorkOrderStatus(workOrder.id, 'synced');

      setTimeout(async () => {
        await indexedDBService.deleteWorkOrder(workOrder.id);
      }, 5000);

      console.log(`✅ Work order ${workOrder.id} synced successfully`);
      console.log(`✅ Work order create id ${createdWorkOrderId}`);

      // Return the created workOrderId and customerRequestNo if this was a create action
      if (workOrder.action === 'create' && createdWorkOrderId) {
        const responseCustomerRequestNo = (response?.data?.data as WorkOrderObj)?.customerRequestNo;
        return {
          realWorkOrderId: createdWorkOrderId,
          customerRequestNo: responseCustomerRequestNo
        };
      }
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  }

  private scheduleRetry() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    const RETRY_DELAY = 30000;

    this.retryTimeout = setTimeout(() => {
      if (this.isOnline) {
        console.log('🔄 Retrying failed syncs...');
        this.syncPendingWorkOrders();
      }
    }, RETRY_DELAY);
  }

  public async getPendingCount(): Promise<number> {
    const counts = await indexedDBService.getWorkOrderCount();
    return counts.pending;
  }

  public async getAllPendingWorkOrders(): Promise<WorkOrderOfflineData[]> {
    return await indexedDBService.getAllPendingWorkOrders();
  }

  public async clearSyncedWorkOrders(): Promise<void> {
    await indexedDBService.clearSyncedWorkOrders();
  }

  public async saveMaterialEquipmentOffline(
    data: any,
    action: 'create' | 'update' | 'delete' | 'toggleActive' = 'create',
    customId?: string
  ): Promise<string> {
    const id = customId || `offline-material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(`💾 Attempting to save material equipment offline:`, { id, action, data });

    try {
      await indexedDBService.saveMaterialEquipment(id, data, action);
      console.log(`✅ Material equipment saved offline successfully: ${id}`);
    } catch (error) {
      console.error(`❌ Failed to save material equipment offline:`, error);
      throw error;
    }

    if (this.isOnline) {
      console.log(`🔄 Online detected, triggering sync...`);
      this.syncPendingMaterialEquipments();
    }

    return id;
  }

  public async deleteMaterialEquipmentOffline(
    uuid: string,
    materialName?: string
  ): Promise<string> {
    const id = `offline-delete-${uuid}-${Date.now()}`;
    const data = { uuid, name: materialName };

    await indexedDBService.saveMaterialEquipment(id, data, 'delete');

    console.log(`💾 Material equipment delete saved offline: ${id}`);

    if (this.isOnline) {
      this.syncPendingMaterialEquipments();
    }

    return id;
  }

  public async toggleMaterialEquipmentActiveOffline(
    uuid: string,
    isActive: boolean,
    materialName?: string
  ): Promise<string> {
    const id = `offline-toggle-${uuid}-${Date.now()}`;
    const data = { uuid, isActive, name: materialName };

    await indexedDBService.saveMaterialEquipment(id, data, 'toggleActive');

    console.log(`💾 Material equipment toggle active saved offline: ${id}`);

    if (this.isOnline) {
      this.syncPendingMaterialEquipments();
    }

    return id;
  }

  public async syncPendingMaterialEquipments(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    this.notifyCallbacks('syncing');

    try {
      const pendingMaterials = await indexedDBService.getAllPendingMaterialEquipments();

      if (pendingMaterials.length === 0) {
        this.syncInProgress = false;
        this.notifyCallbacks('synced', 0);
        return;
      }

      console.log(`🔄 Syncing ${pendingMaterials.length} pending material equipments...`);

      let successCount = 0;
      let failCount = 0;

      for (const material of pendingMaterials) {
        try {
          await this.syncSingleMaterialEquipment(material);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync material equipment ${material.id}:`, error);
          failCount++;

          await indexedDBService.updateMaterialEquipmentStatus(
            material.id,
            'failed',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      console.log(`✅ Material equipment sync completed: ${successCount} success, ${failCount} failed`);

      this.notifyCallbacks('synced', successCount);
      this.notifySyncCompletion('materialEquipment', successCount);

      if (failCount > 0) {
        this.scheduleRetry();
      }

    } catch (error) {
      console.error('Material equipment sync error:', error);
      this.notifyCallbacks('error');
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncSingleMaterialEquipment(material: MaterialEquipmentOfflineData): Promise<void> {
    const MAX_RETRY_COUNT = 3;

    if (material.retryCount >= MAX_RETRY_COUNT) {
      console.warn(`Max retry count reached for material equipment ${material.id}`);
      throw new Error('Max retry count exceeded');
    }

    let response;

    if (material.action === 'create') {
      response = await createDataMaterials(material.data);
    } else if (material.action === 'delete') {
      const materialId = material.data.uuid || material.data.id;
      response = await deleteMaterialEquipment(materialId);
    } else if (material.action === 'toggleActive') {
      const materialId = material.data.uuid || material.data.id;
      const isActive = material.data.isActive;
      response = await updateActiveStatusMaterial(materialId, isActive);
    } else {
      const materialId = material.data.id || material.id.replace('offline-material-', '');
      response = await updateDataMaterials(materialId, material.data);
    }

    if (response.status === 200 || response.status === 201 || response.status === 204) {
      await indexedDBService.updateMaterialEquipmentStatus(material.id, 'synced');

      setTimeout(async () => {
        await indexedDBService.deleteMaterialEquipment(material.id);
      }, 5000);

      console.log(`✅ Material equipment ${material.id} synced successfully`);
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  }

  public async getPendingMaterialEquipmentCount(): Promise<number> {
    const counts = await indexedDBService.getMaterialEquipmentCount();
    return counts.pending;
  }

  public async getAllPendingMaterialEquipments(): Promise<MaterialEquipmentOfflineData[]> {
    return await indexedDBService.getAllPendingMaterialEquipments();
  }

  public async clearSyncedMaterialEquipments(): Promise<void> {
    await indexedDBService.clearSyncedMaterialEquipments();
  }

  public async saveSurveyOffline(
    surveyId: string,
    data: any
  ): Promise<string> {
    const id = `offline-survey-${surveyId}-${Date.now()}`;

    await indexedDBService.saveSurvey(id, { surveyId, ...data }, 'update');

    console.log(`💾 Survey saved offline: ${id}`);

    if (this.isOnline) {
      this.syncPendingSurveys();
    }

    return id;
  }

  public async syncPendingSurveys(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    this.notifyCallbacks('syncing');

    try {
      const pendingSurveys = await indexedDBService.getAllPendingSurveys();

      if (pendingSurveys.length === 0) {
        this.syncInProgress = false;
        this.notifyCallbacks('synced', 0);
        return;
      }

      console.log(`🔄 Syncing ${pendingSurveys.length} pending surveys...`);

      let successCount = 0;
      let failCount = 0;

      for (const survey of pendingSurveys) {
        try {
          await this.syncSingleSurvey(survey);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync survey ${survey.id}:`, error);
          failCount++;

          await indexedDBService.updateSurveyStatus(
            survey.id,
            'failed',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      console.log(`✅ Survey sync completed: ${successCount} success, ${failCount} failed`);

      this.notifyCallbacks('synced', successCount);
      this.notifySyncCompletion('survey', successCount);

      if (failCount > 0) {
        this.scheduleRetry();
      }

    } catch (error) {
      console.error('Survey sync error:', error);
      this.notifyCallbacks('error');
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncSingleSurvey(survey: SurveyOfflineData): Promise<void> {
    const MAX_RETRY_COUNT = 3;

    if (survey.retryCount >= MAX_RETRY_COUNT) {
      console.warn(`Max retry count reached for survey ${survey.id}`);
      throw new Error('Max retry count exceeded');
    }

    const surveyId = survey.data.surveyId;
    const surveyData = { ...survey.data };

    if (surveyData.images && Array.isArray(surveyData.images)) {
      const hasOfflineImages = surveyData.images.some((id: number | string) => isOfflineImageId(id));

      if (hasOfflineImages) {
        console.log(`🔄 Survey ${survey.id} has offline images, syncing them first...`);

        const idMapping = await this.syncPendingSurveyImages();
        const existingMapping = await this.getImageIdMapping();
        const combinedMapping = new Map([...existingMapping, ...idMapping]);

        surveyData.images = await this.replaceOfflineImageIds(surveyData.images, combinedMapping);
        console.log(`📝 Replaced offline image IDs with server IDs:`, surveyData.images);
      }
    }

    const response = await updateWorkOrderSurvey(surveyId, surveyData);

    if (response.status === 200 || response.status === 201) {
      await indexedDBService.updateSurveyStatus(survey.id, 'synced');

      setTimeout(async () => {
        await indexedDBService.deleteSurvey(survey.id);
      }, 5000);

      console.log(`✅ Survey ${survey.id} synced successfully`);
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  }

  public async getPendingSurveyCount(): Promise<number> {
    const counts = await indexedDBService.getSurveyCount();
    return counts.pending;
  }

  public async getAllPendingSurveys(): Promise<SurveyOfflineData[]> {
    return await indexedDBService.getAllPendingSurveys();
  }

  public async clearSyncedSurveys(): Promise<void> {
    await indexedDBService.clearSyncedSurveys();
  }

  public async syncPendingSurveyImages(): Promise<Map<string, number>> {
    const idMapping = new Map<string, number>();

    if (!this.isOnline) {
      return idMapping;
    }

    try {
      const pendingImages = await indexedDBService.getAllPendingSurveyImages();

      if (pendingImages.length === 0) {
        return idMapping;
      }

      console.log(`🔄 Syncing ${pendingImages.length} pending survey images...`);

      for (const image of pendingImages) {
        try {
          const file = base64ToFile(image.imageData, image.fileName, image.mimeType);
          const response = await uploadWorkOrderSurveyImage(file);

          if (response?.status === 201 && response?.data?.id) {
            const serverId = response.data.id as number;
            idMapping.set(image.id, serverId);

            await indexedDBService.updateSurveyImageStatus(image.id, 'synced', serverId);

            setTimeout(async () => {
              await indexedDBService.deleteSurveyImage(image.id);
            }, 5000);

            console.log(`✅ Survey image ${image.id} synced successfully -> server ID: ${serverId}`);
          } else {
            throw new Error('Failed to upload image');
          }
        } catch (error) {
          console.error(`Failed to sync survey image ${image.id}:`, error);
          await indexedDBService.updateSurveyImageStatus(
            image.id,
            'failed',
            undefined,
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      console.log(`✅ Survey image sync completed: ${idMapping.size} synced`);
      return idMapping;

    } catch (error) {
      console.error('Survey image sync error:', error);
      return idMapping;
    }
  }

  public async getImageIdMapping(): Promise<Map<string, number>> {
    const mapping = new Map<string, number>();
    const syncedImages = await indexedDBService.getAllSurveyImages();

    for (const image of syncedImages) {
      if (image.status === 'synced' && image.serverId) {
        mapping.set(image.id, image.serverId);
      }
    }

    return mapping;
  }

  private async replaceOfflineImageIds(
    images: (number | string)[],
    idMapping: Map<string, number>
  ): Promise<number[]> {
    const result: number[] = [];

    for (const imageId of images) {
      if (isOfflineImageId(imageId)) {
        const serverId = idMapping.get(imageId as string);
        if (serverId) {
          result.push(serverId);
        } else {
          const image = await indexedDBService.getSurveyImage(imageId as string);
          if (image?.serverId) {
            result.push(image.serverId);
          } else {
            console.warn(`No server ID found for offline image: ${imageId}`);
          }
        }
      } else if (typeof imageId === 'number') {
        result.push(imageId);
      }
    }

    return result;
  }

  public async getAllPendingSurveyImages(): Promise<SurveyImageOfflineData[]> {
    return await indexedDBService.getAllPendingSurveyImages();
  }

  public async getPendingSurveyImageCount(): Promise<number> {
    const counts = await indexedDBService.getSurveyImageCount();
    return counts.pending;
  }

  public async syncPendingExecutionImages(): Promise<Map<string, number>> {
    const idMapping = new Map<string, number>();

    if (!this.isOnline) {
      return idMapping;
    }

    try {
      const pendingImages = await indexedDBService.getAllPendingExecutionImages();

      if (pendingImages.length === 0) {
        return idMapping;
      }

      console.log(`🔄 Syncing ${pendingImages.length} pending execution images...`);

      for (const image of pendingImages) {
        try {
          const file = base64ToFile(image.imageData, image.fileName, image.mimeType);
          const response = await uploadWorkOrderExecutionImage(file);

          if (response?.status === 201 && response?.data?.id) {
            const serverId = response.data.id as number;
            idMapping.set(image.id, serverId);

            await indexedDBService.updateExecutionImageStatus(image.id, 'synced', serverId);

            setTimeout(async () => {
              await indexedDBService.deleteExecutionImage(image.id);
            }, 5000);

            console.log(`✅ Execution image ${image.id} synced successfully -> server ID: ${serverId}`);
          } else {
            throw new Error('Failed to upload execution image');
          }
        } catch (error) {
          console.error(`Failed to sync execution image ${image.id}:`, error);
          await indexedDBService.updateExecutionImageStatus(
            image.id,
            'failed',
            undefined,
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      console.log(`✅ Execution image sync completed: ${idMapping.size} synced`);
      return idMapping;

    } catch (error) {
      console.error('Execution image sync error:', error);
      return idMapping;
    }
  }

  public async syncPendingExecutionAttachments(): Promise<Map<string, number>> {
    const idMapping = new Map<string, number>();

    if (!this.isOnline) {
      return idMapping;
    }

    try {
      const pendingAttachments = await indexedDBService.getAllPendingExecutionAttachments();

      if (pendingAttachments.length === 0) {
        return idMapping;
      }

      console.log(`🔄 Syncing ${pendingAttachments.length} pending execution attachments...`);

      for (const attachment of pendingAttachments) {
        try {
          const file = base64ToFile(attachment.fileData, attachment.fileName, attachment.mimeType);
          const response = await uploadWorkOrderExecutionAttachment(file);

          if (response?.status === 201 && response?.data?.id) {
            const serverId = response.data.id as number;
            idMapping.set(attachment.id, serverId);

            await indexedDBService.updateExecutionAttachmentStatus(attachment.id, 'synced', serverId);

            setTimeout(async () => {
              await indexedDBService.deleteExecutionAttachment(attachment.id);
            }, 5000);

            console.log(`✅ Execution attachment ${attachment.id} synced successfully -> server ID: ${serverId}`);
          } else {
            throw new Error('Failed to upload execution attachment');
          }
        } catch (error) {
          console.error(`Failed to sync execution attachment ${attachment.id}:`, error);
          await indexedDBService.updateExecutionAttachmentStatus(
            attachment.id,
            'failed',
            undefined,
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      console.log(`✅ Execution attachment sync completed: ${idMapping.size} synced`);
      return idMapping;

    } catch (error) {
      console.error('Execution attachment sync error:', error);
      return idMapping;
    }
  }

  public async getExecutionImageIdMapping(): Promise<Map<string, number>> {
    const mapping = new Map<string, number>();
    const syncedImages = await indexedDBService.getAllPendingExecutionImages();

    for (const image of syncedImages) {
      if (image.status === 'synced' && image.serverId) {
        mapping.set(image.id, image.serverId);
      }
    }

    return mapping;
  }

  public async getExecutionAttachmentIdMapping(): Promise<Map<string, number>> {
    const mapping = new Map<string, number>();
    const syncedAttachments = await indexedDBService.getAllPendingExecutionAttachments();

    for (const attachment of syncedAttachments) {
      if (attachment.status === 'synced' && attachment.serverId) {
        mapping.set(attachment.id, attachment.serverId);
      }
    }

    return mapping;
  }

  private async replaceOfflineExecutionImageIds(
    images: (number | string)[],
    idMapping: Map<string, number>
  ): Promise<number[]> {
    const result: number[] = [];

    for (const imageId of images) {
      if (isOfflineExecutionImageId(imageId)) {
        const serverId = idMapping.get(imageId as string);
        if (serverId) {
          result.push(serverId);
        } else {
          const image = await indexedDBService.getExecutionImage(imageId as string);
          if (image?.serverId) {
            result.push(image.serverId);
          } else {
            console.warn(`No server ID found for offline execution image: ${imageId}`);
          }
        }
      } else if (typeof imageId === 'number') {
        result.push(imageId);
      }
    }

    return result;
  }

  private async replaceOfflineExecutionAttachmentIds(
    attachments: (number | string)[],
    idMapping: Map<string, number>
  ): Promise<number[]> {
    const result: number[] = [];

    for (const attachmentId of attachments) {
      if (isOfflineExecutionAttachmentId(attachmentId)) {
        const serverId = idMapping.get(attachmentId as string);
        if (serverId) {
          result.push(serverId);
        } else {
          const attachment = await indexedDBService.getExecutionAttachment(attachmentId as string);
          if (attachment?.serverId) {
            result.push(attachment.serverId);
          } else {
            console.warn(`No server ID found for offline execution attachment: ${attachmentId}`);
          }
        }
      } else if (typeof attachmentId === 'number') {
        result.push(attachmentId);
      }
    }

    return result;
  }

  public async getAllPendingExecutionImages(): Promise<ExecutionImageOfflineData[]> {
    return await indexedDBService.getAllPendingExecutionImages();
  }

  public async getAllPendingExecutionAttachments(): Promise<ExecutionAttachmentOfflineData[]> {
    return await indexedDBService.getAllPendingExecutionAttachments();
  }

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    this.syncCallbacks.clear();
  }
}

export const offlineSyncService = new OfflineSyncService();
