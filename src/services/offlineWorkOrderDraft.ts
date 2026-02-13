import { indexedDBService } from '@/lib/indexedDB';

export interface WorkOrderDraftData {
  id: string;
  workOrderNo: string;
  serviceId: string;
  requestCode: string;
  workOrderType: 'single' | 'bulk';
  customerRequestNo?: string;
  workOrderParentId?: string;
  selectedPeaOffices?: string[];
  peaOffice?: string;
  peaNameFull?: string;
  officePlant?: string;
  costCenter?: string;
  sapOrderNo?: string;
  serviceName?: string;
  defaultActivityPmCode?: string;
  timestamp: number;
  bulkType?: 'reference_request' | 'no_reference' | 'reference_parent';
}

const DRAFT_STORE_NAME = 'workOrderDrafts';

class OfflineWorkOrderDraftService {
  private generateOfflineId(): string {
    return `offline-wo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOfflineWorkOrderNo(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `OFFLINE-${timestamp}-${random}`;
  }

  async saveDraft(draftData: Omit<WorkOrderDraftData, 'id' | 'timestamp'>): Promise<WorkOrderDraftData> {
    const id = this.generateOfflineId();
    const workOrderNo = draftData.workOrderNo || this.generateOfflineWorkOrderNo();
    
    const draft: WorkOrderDraftData = {
      ...draftData,
      id,
      workOrderNo,
      timestamp: Date.now(),
    };

    console.log(`💾 Saving work order draft offline:`, draft);
    
    await indexedDBService.saveWorkOrder(id, draft, 'create');
    
    // Verify the draft was saved
    const saved = await indexedDBService.getWorkOrder(id);
    if (!saved) {
      throw new Error('Failed to save draft to IndexedDB');
    }
    
    console.log(`✅ Work order draft saved and verified: ${id}`);
    
    return draft;
  }

  async getDraft(id: string): Promise<WorkOrderDraftData | null> {
    try {
      console.log('🔍 getDraft - Attempting to get draft with id:', id);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('IndexedDB timeout')), 5000);
      });
      
      const workOrderPromise = indexedDBService.getWorkOrder(id);
      
      console.log('🔍 getDraft - Waiting for IndexedDB response...');
      const workOrder = await Promise.race([workOrderPromise, timeoutPromise]);
      
      console.log('🔍 getDraft - Retrieved workOrder:', workOrder);
      
      if (!workOrder) {
        console.warn('⚠️ getDraft - No workOrder found in IndexedDB');
        return null;
      }
      
      const draftData = workOrder?.data as WorkOrderDraftData;
      console.log('🔍 getDraft - Parsed draftData:', draftData);
      return draftData || null;
    } catch (error) {
      console.error('❌ getDraft - Error getting draft:', error);
      console.error('❌ getDraft - Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      return null;
    }
  }

  async deleteDraft(id: string): Promise<void> {
    try {
      await indexedDBService.deleteWorkOrder(id);
      console.log(`🗑️ Work order draft deleted: ${id}`);
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  }

  isOfflineId(id: string): boolean {
    return id.startsWith('offline-wo-');
  }

  isOfflineWorkOrderNo(workOrderNo: string): boolean {
    return workOrderNo.startsWith('OFFLINE-');
  }
}

export const offlineWorkOrderDraftService = new OfflineWorkOrderDraftService();
