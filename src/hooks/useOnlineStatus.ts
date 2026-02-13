import { useState, useEffect } from 'react';
import { offlineSyncService } from '@/services/offlineSync';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(() => {
    return offlineSyncService.getOnlineStatus();
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      console.log('📡 Online event detected');
      setIsOnline(offlineSyncService.getOnlineStatus());
    };
    const handleOffline = () => {
      console.log('📡 Offline event detected');
      setIsOnline(offlineSyncService.getOnlineStatus());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const syncCallback = (status: 'syncing' | 'synced' | 'error', count?: number) => {
      setSyncStatus(status);
      if (status === 'synced' && count !== undefined) {
        updatePendingCount();
      }
    };

    offlineSyncService.addSyncCallback(syncCallback);

    const updatePendingCount = async () => {
      const workOrderCount = await offlineSyncService.getPendingCount();
      const materialEquipmentCount = await offlineSyncService.getPendingMaterialEquipmentCount();
      const surveyCount = await offlineSyncService.getPendingSurveyCount();
      setPendingCount(workOrderCount + materialEquipmentCount + surveyCount);
    };

    updatePendingCount();

    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      offlineSyncService.removeSyncCallback(syncCallback);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    syncStatus,
    pendingCount,
    syncNow: async () => {
      await offlineSyncService.syncPendingWorkOrders();
      await offlineSyncService.syncPendingMaterialEquipments();
      await offlineSyncService.syncPendingSurveys();
    },
  };
};
