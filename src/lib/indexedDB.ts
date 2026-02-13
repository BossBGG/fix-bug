export interface WorkOrderOfflineData {
  id: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  action: 'create' | 'update' | 'cancel' | 'complete_single' | 'complete_bulk' | 'update_status';
  retryCount: number;
  error?: string;
}

export interface MaterialEquipmentOfflineData {
  id: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  action: 'create' | 'update' | 'delete' | 'toggleActive';
  retryCount: number;
  error?: string;
}

export interface SurveyOfflineData {
  id: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  action: 'update';
  retryCount: number;
  error?: string;
}

export interface SurveyImageOfflineData {
  id: string;
  surveyId: string;
  imageData: string;
  fileName: string;
  mimeType: string;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  serverId?: number;
  retryCount: number;
  error?: string;
}

export interface ExecutionImageOfflineData {
  id: string;
  workOrderId: string;
  imageData: string;
  fileName: string;
  mimeType: string;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  serverId?: number;
  retryCount: number;
  error?: string;
}

export interface ExecutionAttachmentOfflineData {
  id: string;
  workOrderId: string;
  fileData: string;
  fileName: string;
  mimeType: string;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  serverId?: number;
  retryCount: number;
  error?: string;
}

const DB_NAME = 'pea-work-order-db';
const DB_VERSION = 7;
const STORE_NAME = 'workOrders';
const MATERIAL_STORE_NAME = 'materialEquipments';
const SURVEY_STORE_NAME = 'surveys';
const SURVEY_IMAGE_STORE_NAME = 'surveyImages';
const EXECUTION_IMAGE_STORE_NAME = 'executionImages';
const EXECUTION_ATTACHMENT_STORE_NAME = 'executionAttachments';

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-status', 'status', { unique: false });
          store.createIndex('by-timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains(MATERIAL_STORE_NAME)) {
          const materialStore = db.createObjectStore(MATERIAL_STORE_NAME, { keyPath: 'id' });
          materialStore.createIndex('by-status', 'status', { unique: false });
          materialStore.createIndex('by-timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains(SURVEY_STORE_NAME)) {
          const surveyStore = db.createObjectStore(SURVEY_STORE_NAME, { keyPath: 'id' });
          surveyStore.createIndex('by-status', 'status', { unique: false });
          surveyStore.createIndex('by-timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains(SURVEY_IMAGE_STORE_NAME)) {
          const surveyImageStore = db.createObjectStore(SURVEY_IMAGE_STORE_NAME, { keyPath: 'id' });
          surveyImageStore.createIndex('by-status', 'status', { unique: false });
          surveyImageStore.createIndex('by-survey-id', 'surveyId', { unique: false });
          surveyImageStore.createIndex('by-timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains(EXECUTION_IMAGE_STORE_NAME)) {
          const executionImageStore = db.createObjectStore(EXECUTION_IMAGE_STORE_NAME, { keyPath: 'id' });
          executionImageStore.createIndex('by-status', 'status', { unique: false });
          executionImageStore.createIndex('by-work-order-id', 'workOrderId', { unique: false });
          executionImageStore.createIndex('by-timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains(EXECUTION_ATTACHMENT_STORE_NAME)) {
          const executionAttachmentStore = db.createObjectStore(EXECUTION_ATTACHMENT_STORE_NAME, { keyPath: 'id' });
          executionAttachmentStore.createIndex('by-status', 'status', { unique: false });
          executionAttachmentStore.createIndex('by-work-order-id', 'workOrderId', { unique: false });
          executionAttachmentStore.createIndex('by-timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveWorkOrder(
    id: string,
    data: any,
    action: 'create' | 'update' | 'cancel' | 'complete_single' | 'complete_bulk' | 'update_status' = 'create'
  ): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put({
        id,
        data,
        timestamp: Date.now(),
        status: 'pending' as const,
        action,
        retryCount: 0,
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getWorkOrder(id: string): Promise<WorkOrderOfflineData | undefined> {
    try {
      const db = await this.init();

      return new Promise((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);

          // Try to get all keys first to verify the record exists
          /*const keysRequest = store.getAllKeys();
          keysRequest.onsuccess = () => {
            console.log('📦 IndexedDB.getWorkOrder - All keys:', keysRequest.result);
            console.log('📦 IndexedDB.getWorkOrder - Looking for key:', id);
            console.log('📦 IndexedDB.getWorkOrder - Key exists:', keysRequest.result.includes(id));
          };*/

          const request = store.get(id);
          let resolved = false;

          request.onsuccess = (event) => {
            /*console.log('📦 IndexedDB.getWorkOrder - onsuccess triggered');
            console.log('📦 IndexedDB.getWorkOrder - event.target:', event.target);
            console.log('📦 IndexedDB.getWorkOrder - request.result:', request.result);*/
            if (!resolved) {
              resolved = true;
              resolve(request.result);
            }
          };

          request.onerror = (event) => {
            // console.error('📦 IndexedDB.getWorkOrder - onerror triggered');
            // console.error('📦 IndexedDB.getWorkOrder - ERROR:', request.error);
            if (!resolved) {
              resolved = true;
              reject(request.error);
            }
          };

          tx.oncomplete = () => {
            // console.log('📦 IndexedDB.getWorkOrder - Transaction complete');
            // If request hasn't resolved yet, resolve with undefined
            if (!resolved) {
              // console.warn('📦 IndexedDB.getWorkOrder - Transaction complete but request not resolved');
              resolved = true;
              resolve(undefined);
            }
          };

          tx.onerror = (event) => {
            // console.error('📦 IndexedDB.getWorkOrder - Transaction error');
            // console.error('📦 IndexedDB.getWorkOrder - tx.error:', tx.error);
            if (!resolved) {
              resolved = true;
              reject(tx.error || new Error('Transaction failed'));
            }
          };

          tx.onabort = (event) => {
            // console.error('📦 IndexedDB.getWorkOrder - Transaction aborted');
            if (!resolved) {
              resolved = true;
              reject(new Error('Transaction aborted'));
            }
          };
        } catch (error) {
          // console.error('📦 IndexedDB.getWorkOrder - Error in promise:', error);
          reject(error);
        }
      });
    } catch (error) {
      // console.error('📦 IndexedDB.getWorkOrder - Caught error:', error);
      throw error;
    }
  }

  async getAllPendingWorkOrders(): Promise<WorkOrderOfflineData[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('by-status');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllWorkOrders(): Promise<WorkOrderOfflineData[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateWorkOrderStatus(
    id: string,
    status: 'pending' | 'synced' | 'failed',
    error?: string
  ): Promise<void> {
    const db = await this.init();
    const workOrder = await this.getWorkOrder(id);

    if (!workOrder) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      workOrder.status = status;
      if (error) workOrder.error = error;
      if (status === 'failed') workOrder.retryCount += 1;

      const request = store.put(workOrder);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteWorkOrder(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncedWorkOrders(): Promise<void> {
    const db = await this.init();
    const syncedItems = await new Promise<WorkOrderOfflineData[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('by-status');
      const request = index.getAll('synced');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (syncedItems.length === 0) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      syncedItems.forEach((item: WorkOrderOfflineData) => {
        store.delete(item.id);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getWorkOrderCount(): Promise<{
    total: number;
    pending: number;
    synced: number;
    failed: number;
  }> {
    const all = await this.getAllWorkOrders();

    return {
      total: all.length,
      pending: all.filter((item: WorkOrderOfflineData) => item.status === 'pending').length,
      synced: all.filter((item: WorkOrderOfflineData) => item.status === 'synced').length,
      failed: all.filter((item: WorkOrderOfflineData) => item.status === 'failed').length,
    };
  }

  async saveMaterialEquipment(
    id: string,
    data: any,
    action: 'create' | 'update' | 'delete' | 'toggleActive' = 'create'
  ): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MATERIAL_STORE_NAME, 'readwrite');
      const store = tx.objectStore(MATERIAL_STORE_NAME);
      const request = store.put({
        id,
        data,
        timestamp: Date.now(),
        status: 'pending' as const,
        action,
        retryCount: 0,
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMaterialEquipment(id: string): Promise<MaterialEquipmentOfflineData | undefined> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MATERIAL_STORE_NAME, 'readonly');
      const store = tx.objectStore(MATERIAL_STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPendingMaterialEquipments(): Promise<MaterialEquipmentOfflineData[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MATERIAL_STORE_NAME, 'readonly');
      const store = tx.objectStore(MATERIAL_STORE_NAME);
      const index = store.index('by-status');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllMaterialEquipments(): Promise<MaterialEquipmentOfflineData[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MATERIAL_STORE_NAME, 'readonly');
      const store = tx.objectStore(MATERIAL_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateMaterialEquipmentStatus(
    id: string,
    status: 'pending' | 'synced' | 'failed',
    error?: string
  ): Promise<void> {
    const db = await this.init();
    const materialEquipment = await this.getMaterialEquipment(id);

    if (!materialEquipment) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(MATERIAL_STORE_NAME, 'readwrite');
      const store = tx.objectStore(MATERIAL_STORE_NAME);

      materialEquipment.status = status;
      if (error) materialEquipment.error = error;
      if (status === 'failed') materialEquipment.retryCount += 1;

      const request = store.put(materialEquipment);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMaterialEquipment(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MATERIAL_STORE_NAME, 'readwrite');
      const store = tx.objectStore(MATERIAL_STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncedMaterialEquipments(): Promise<void> {
    const db = await this.init();
    const syncedItems = await new Promise<MaterialEquipmentOfflineData[]>((resolve, reject) => {
      const tx = db.transaction(MATERIAL_STORE_NAME, 'readonly');
      const store = tx.objectStore(MATERIAL_STORE_NAME);
      const index = store.index('by-status');
      const request = index.getAll('synced');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (syncedItems.length === 0) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(MATERIAL_STORE_NAME, 'readwrite');
      const store = tx.objectStore(MATERIAL_STORE_NAME);

      syncedItems.forEach((item: MaterialEquipmentOfflineData) => {
        store.delete(item.id);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getMaterialEquipmentCount(): Promise<{
    total: number;
    pending: number;
    synced: number;
    failed: number;
  }> {
    const all = await this.getAllMaterialEquipments();

    return {
      total: all.length,
      pending: all.filter((item: MaterialEquipmentOfflineData) => item.status === 'pending').length,
      synced: all.filter((item: MaterialEquipmentOfflineData) => item.status === 'synced').length,
      failed: all.filter((item: MaterialEquipmentOfflineData) => item.status === 'failed').length,
    };
  }

  async saveSurvey(
    id: string,
    data: any,
    action: 'update' = 'update'
  ): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_STORE_NAME, 'readwrite');
      const store = tx.objectStore(SURVEY_STORE_NAME);
      const request = store.put({
        id,
        data,
        timestamp: Date.now(),
        status: 'pending' as const,
        action,
        retryCount: 0,
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSurvey(id: string): Promise<SurveyOfflineData | undefined> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_STORE_NAME, 'readonly');
      const store = tx.objectStore(SURVEY_STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPendingSurveys(): Promise<SurveyOfflineData[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_STORE_NAME, 'readonly');
      const store = tx.objectStore(SURVEY_STORE_NAME);
      const index = store.index('by-status');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSurveys(): Promise<SurveyOfflineData[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_STORE_NAME, 'readonly');
      const store = tx.objectStore(SURVEY_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateSurveyStatus(
    id: string,
    status: 'pending' | 'synced' | 'failed',
    error?: string
  ): Promise<void> {
    const db = await this.init();
    const survey = await this.getSurvey(id);

    if (!survey) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_STORE_NAME, 'readwrite');
      const store = tx.objectStore(SURVEY_STORE_NAME);

      survey.status = status;
      if (error) survey.error = error;
      if (status === 'failed') survey.retryCount += 1;

      const request = store.put(survey);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSurvey(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_STORE_NAME, 'readwrite');
      const store = tx.objectStore(SURVEY_STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncedSurveys(): Promise<void> {
    const db = await this.init();
    const syncedItems = await new Promise<SurveyOfflineData[]>((resolve, reject) => {
      const tx = db.transaction(SURVEY_STORE_NAME, 'readonly');
      const store = tx.objectStore(SURVEY_STORE_NAME);
      const index = store.index('by-status');
      const request = index.getAll('synced');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (syncedItems.length === 0) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_STORE_NAME, 'readwrite');
      const store = tx.objectStore(SURVEY_STORE_NAME);

      syncedItems.forEach((item: SurveyOfflineData) => {
        store.delete(item.id);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getSurveyCount(): Promise<{
    total: number;
    pending: number;
    synced: number;
    failed: number;
  }> {
    const all = await this.getAllSurveys();

    return {
      total: all.length,
      pending: all.filter((item: SurveyOfflineData) => item.status === 'pending').length,
      synced: all.filter((item: SurveyOfflineData) => item.status === 'synced').length,
      failed: all.filter((item: SurveyOfflineData) => item.status === 'failed').length,
    };
  }

  async saveSurveyImage(
    id: string,
    surveyId: string,
    imageData: string,
    fileName: string,
    mimeType: string
  ): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_IMAGE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(SURVEY_IMAGE_STORE_NAME);
      const request = store.put({
        id,
        surveyId,
        imageData,
        fileName,
        mimeType,
        timestamp: Date.now(),
        status: 'pending' as const,
        retryCount: 0,
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSurveyImage(id: string): Promise<SurveyImageOfflineData | undefined> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_IMAGE_STORE_NAME, 'readonly');
      const store = tx.objectStore(SURVEY_IMAGE_STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSurveyImagesBySurveyId(surveyId: string): Promise<SurveyImageOfflineData[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_IMAGE_STORE_NAME, 'readonly');
      const store = tx.objectStore(SURVEY_IMAGE_STORE_NAME);
      const index = store.index('by-survey-id');
      const request = index.getAll(surveyId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPendingSurveyImages(): Promise<SurveyImageOfflineData[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_IMAGE_STORE_NAME, 'readonly');
      const store = tx.objectStore(SURVEY_IMAGE_STORE_NAME);
      const index = store.index('by-status');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSurveyImages(): Promise<SurveyImageOfflineData[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_IMAGE_STORE_NAME, 'readonly');
      const store = tx.objectStore(SURVEY_IMAGE_STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateSurveyImageStatus(
    id: string,
    status: 'pending' | 'synced' | 'failed',
    serverId?: number,
    error?: string
  ): Promise<void> {
    const db = await this.init();
    const image = await this.getSurveyImage(id);

    if (!image) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_IMAGE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(SURVEY_IMAGE_STORE_NAME);

      image.status = status;
      if (serverId !== undefined) image.serverId = serverId;
      if (error) image.error = error;
      if (status === 'failed') image.retryCount += 1;

      const request = store.put(image);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSurveyImage(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_IMAGE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(SURVEY_IMAGE_STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncedSurveyImages(): Promise<void> {
    const db = await this.init();
    const syncedItems = await new Promise<SurveyImageOfflineData[]>((resolve, reject) => {
      const tx = db.transaction(SURVEY_IMAGE_STORE_NAME, 'readonly');
      const store = tx.objectStore(SURVEY_IMAGE_STORE_NAME);
      const index = store.index('by-status');
      const request = index.getAll('synced');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (syncedItems.length === 0) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURVEY_IMAGE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(SURVEY_IMAGE_STORE_NAME);

      syncedItems.forEach((item: SurveyImageOfflineData) => {
        store.delete(item.id);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getSurveyImageCount(): Promise<{
    total: number;
    pending: number;
    synced: number;
    failed: number;
  }> {
    const all = await this.getAllSurveyImages();

    return {
      total: all.length,
      pending: all.filter((item: SurveyImageOfflineData) => item.status === 'pending').length,
      synced: all.filter((item: SurveyImageOfflineData) => item.status === 'synced').length,
      failed: all.filter((item: SurveyImageOfflineData) => item.status === 'failed').length,
    };
  }

  async saveExecutionImage(
    id: string,
    workOrderId: string,
    imageData: string,
    fileName: string,
    mimeType: string
  ): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXECUTION_IMAGE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(EXECUTION_IMAGE_STORE_NAME);
      const request = store.put({
        id,
        workOrderId,
        imageData,
        fileName,
        mimeType,
        timestamp: Date.now(),
        status: 'pending' as const,
        retryCount: 0,
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getExecutionImage(id: string): Promise<ExecutionImageOfflineData | undefined> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXECUTION_IMAGE_STORE_NAME, 'readonly');
      const store = tx.objectStore(EXECUTION_IMAGE_STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getExecutionImagesByWorkOrderId(workOrderId: string): Promise<ExecutionImageOfflineData[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXECUTION_IMAGE_STORE_NAME, 'readonly');
      const store = tx.objectStore(EXECUTION_IMAGE_STORE_NAME);
      const index = store.index('by-work-order-id');
      const request = index.getAll(workOrderId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPendingExecutionImages(): Promise<ExecutionImageOfflineData[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXECUTION_IMAGE_STORE_NAME, 'readonly');
      const store = tx.objectStore(EXECUTION_IMAGE_STORE_NAME);
      const index = store.index('by-status');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateExecutionImageStatus(
    id: string,
    status: 'pending' | 'synced' | 'failed',
    serverId?: number,
    error?: string
  ): Promise<void> {
    const db = await this.init();
    const image = await this.getExecutionImage(id);

    if (!image) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXECUTION_IMAGE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(EXECUTION_IMAGE_STORE_NAME);

      image.status = status;
      if (serverId !== undefined) image.serverId = serverId;
      if (error) image.error = error;
      if (status === 'failed') image.retryCount += 1;

      const request = store.put(image);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteExecutionImage(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXECUTION_IMAGE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(EXECUTION_IMAGE_STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncedExecutionImages(): Promise<void> {
    const db = await this.init();
    const syncedItems = await new Promise<ExecutionImageOfflineData[]>((resolve, reject) => {
      const tx = db.transaction(EXECUTION_IMAGE_STORE_NAME, 'readonly');
      const store = tx.objectStore(EXECUTION_IMAGE_STORE_NAME);
      const index = store.index('by-status');
      const request = index.getAll('synced');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (syncedItems.length === 0) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXECUTION_IMAGE_STORE_NAME, 'readwrite');
      const store = tx.objectStore(EXECUTION_IMAGE_STORE_NAME);

      syncedItems.forEach((item: ExecutionImageOfflineData) => {
        store.delete(item.id);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async saveExecutionAttachment(
    id: string,
    workOrderId: string,
    fileData: string,
    fileName: string,
    mimeType: string
  ): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXECUTION_ATTACHMENT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(EXECUTION_ATTACHMENT_STORE_NAME);
      const request = store.put({
        id,
        workOrderId,
        fileData,
        fileName,
        mimeType,
        timestamp: Date.now(),
        status: 'pending' as const,
        retryCount: 0,
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getExecutionAttachment(id: string): Promise<ExecutionAttachmentOfflineData | undefined> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXECUTION_ATTACHMENT_STORE_NAME, 'readonly');
      const store = tx.objectStore(EXECUTION_ATTACHMENT_STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getExecutionAttachmentsByWorkOrderId(workOrderId: string): Promise<ExecutionAttachmentOfflineData[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXECUTION_ATTACHMENT_STORE_NAME, 'readonly');
      const store = tx.objectStore(EXECUTION_ATTACHMENT_STORE_NAME);
      const index = store.index('by-work-order-id');
      const request = index.getAll(workOrderId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPendingExecutionAttachments(): Promise<ExecutionAttachmentOfflineData[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXECUTION_ATTACHMENT_STORE_NAME, 'readonly');
      const store = tx.objectStore(EXECUTION_ATTACHMENT_STORE_NAME);
      const index = store.index('by-status');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateExecutionAttachmentStatus(
    id: string,
    status: 'pending' | 'synced' | 'failed',
    serverId?: number,
    error?: string
  ): Promise<void> {
    const db = await this.init();
    const attachment = await this.getExecutionAttachment(id);

    if (!attachment) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXECUTION_ATTACHMENT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(EXECUTION_ATTACHMENT_STORE_NAME);

      attachment.status = status;
      if (serverId !== undefined) attachment.serverId = serverId;
      if (error) attachment.error = error;
      if (status === 'failed') attachment.retryCount += 1;

      const request = store.put(attachment);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteExecutionAttachment(id: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXECUTION_ATTACHMENT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(EXECUTION_ATTACHMENT_STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncedExecutionAttachments(): Promise<void> {
    const db = await this.init();
    const syncedItems = await new Promise<ExecutionAttachmentOfflineData[]>((resolve, reject) => {
      const tx = db.transaction(EXECUTION_ATTACHMENT_STORE_NAME, 'readonly');
      const store = tx.objectStore(EXECUTION_ATTACHMENT_STORE_NAME);
      const index = store.index('by-status');
      const request = index.getAll('synced');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (syncedItems.length === 0) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(EXECUTION_ATTACHMENT_STORE_NAME, 'readwrite');
      const store = tx.objectStore(EXECUTION_ATTACHMENT_STORE_NAME);

      syncedItems.forEach((item: ExecutionAttachmentOfflineData) => {
        store.delete(item.id);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const indexedDBService = new IndexedDBService();
