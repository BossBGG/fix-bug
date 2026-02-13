"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudArrowUp,
  faExclamationTriangle,
  faCheckCircle,
  faTrash,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { WorkOrderOfflineData, MaterialEquipmentOfflineData, SurveyOfflineData, SurveyImageOfflineData } from '@/lib/indexedDB';
import { offlineSyncService } from '@/services/offlineSync';
import { format } from 'date-fns';
import {useOnlineStatus} from "@/hooks/useOnlineStatus";

type PendingItem = 
  | (WorkOrderOfflineData & { type: 'workOrder' })
  | (MaterialEquipmentOfflineData & { type: 'materialEquipment' })
  | (SurveyOfflineData & { type: 'survey' })
  | (SurveyImageOfflineData & { type: 'surveyImage' });

export const OfflinePendingList = () => {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const {isOnline} = useOnlineStatus();

  const loadPendingItems = async () => {
    try {
      const workOrders = await offlineSyncService.getAllPendingWorkOrders();
      const materialEquipments = await offlineSyncService.getAllPendingMaterialEquipments();
      const surveys = await offlineSyncService.getAllPendingSurveys();
      const surveyImages = await offlineSyncService.getAllPendingSurveyImages();
      
      const allItems: PendingItem[] = [
        ...workOrders.map(item => ({ ...item, type: 'workOrder' as const })),
        ...materialEquipments.map(item => ({ ...item, type: 'materialEquipment' as const })),
        ...surveys.map(item => ({ ...item, type: 'survey' as const })),
        ...surveyImages.filter(item => item.status === 'pending').map(item => ({ ...item, type: 'surveyImage' as const }))
      ];
      
      allItems.sort((a, b) => b.timestamp - a.timestamp);
      
      setPendingItems(allItems);
    } catch (error) {
      console.error('Failed to load pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingItems();
    const interval = setInterval(loadPendingItems, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRetrySync = async () => {
    await offlineSyncService.syncPendingWorkOrders();
    await offlineSyncService.syncPendingMaterialEquipments();
    await offlineSyncService.syncPendingSurveyImages();
    await offlineSyncService.syncPendingSurveys();
    await loadPendingItems();
  };

  if (loading) {
    return (
      <Card className="p-4 mb-4">
        <div className="text-center text-gray-500">กำลังโหลด...</div>
      </Card>
    );
  }

  if (pendingItems.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCloudArrowUp} className="text-blue-600" size="lg" />
          <h3 className="font-semibold text-blue-900">
            รายการรอซิงค์ ({pendingItems.length})
          </h3>
        </div>
        {
          isOnline &&
          (
            <button
              onClick={handleRetrySync}
              className="px-3 py-1 bg-blue-600 cursor-pointer text-white rounded hover:bg-blue-700 text-sm flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faSync} size="sm" />
              ซิงค์ทันที
            </button>
          )
        }
      </div>

      <div className="space-y-2">
        {pendingItems.map((item) => (
          <OfflinePendingItem
            key={item.id}
            item={item}
            onUpdate={loadPendingItems}
          />
        ))}
      </div>
    </Card>
  );
};

interface OfflinePendingItemProps {
  item: PendingItem;
  onUpdate: () => void;
}

const OfflinePendingItem = ({ item, onUpdate }: OfflinePendingItemProps) => {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'pending':
        return <FontAwesomeIcon icon={faCloudArrowUp} className="text-blue-600" />;
      case 'synced':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />;
      case 'failed':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600" />;
    }
  };

  const getStatusText = () => {
    switch (item.status) {
      case 'pending':
        return 'รอซิงค์';
      case 'synced':
        return 'ซิงค์สำเร็จ';
      case 'failed':
        return `ซิงค์ล้มเหลว (ลองครั้งที่ ${item.retryCount})`;
    }
  };

  const getActionText = () => {
    if (item.type === 'surveyImage') {
      return 'อัปโหลดรูป';
    }
    const action = item.action;
    switch (action) {
      case 'create':
        return 'สร้างใหม่';
      case 'update':
        return 'แก้ไข';
      case 'delete':
        return 'ลบ';
      case 'cancel':
        return 'ยกเลิก';
      case 'complete_single':
        return 'ปิดงาน (ทีละใบ)';
      case 'complete_bulk':
        return 'ปิดงาน (หลายใบ)';
      case 'toggleActive':
        return item.data?.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน';
      default:
        return action as string;
    }
  };

  const getItemTitle = () => {
    if (item.type === 'workOrder') {
      if ((item.action === 'complete_single' || item.action === 'complete_bulk') && item.data?.workOrderNos) {
        if (item.action === 'complete_single') {
          return item.data.workOrderNos[0] || 'ปิดงาน 1 รายการ';
        }
        return `ปิดงาน ${item.data.workOrderNos.length} รายการ`;
      }
      return item.data?.workOrderNo || item.data?.workOrderId || item.id;
    } else if (item.type === 'survey') {
      return item.data?.surveyId || item.data?.workOrderNo || item.id;
    } else if (item.type === 'surveyImage') {
      return item.fileName || item.id;
    } else {
      return item.data?.name || item.id;
    }
  };

  const getItemType = () => {
    if (item.type === 'workOrder') return 'ใบงาน';
    if (item.type === 'survey') return 'งานสำรวจ';
    if (item.type === 'surveyImage') return 'รูปภาพงานสำรวจ';
    return 'วัสดุและอุปกรณ์';
  };

  return (
    <div className="bg-white p-3 rounded border border-blue-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon()}
            <span className="font-medium text-sm">
              {getItemTitle()}
            </span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {getActionText()}
            </span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
              {getItemType()}
            </span>
          </div>

          <div className="text-xs text-gray-600 space-y-1">
            <div>สถานะ: {getStatusText()}</div>
            {item.type === 'workOrder' && item.data?.customerName && (
              <div>ลูกค้า: {item.data.customerName}</div>
            )}
            {item.type === 'workOrder' && item.action === 'cancel' && item.data?.note && (
              <div>หมายเหตุการยกเลิก: {item.data.note}</div>
            )}
            {item.type === 'workOrder' && (item.action === 'complete_single' || item.action === 'complete_bulk') && item.data?.workOrderNos && (
              <div>จำนวนใบงานที่ปิด: {item.data.workOrderNos.length} รายการ</div>
            )}
            {item.type === 'materialEquipment' && item.data?.materialAndEquipment && (
              <div>จำนวนรายการ: {item.data.materialAndEquipment.length} รายการ</div>
            )}
            <div>
              เวลา: {format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm')}
            </div>
            {item.error && (
              <div className="text-red-600 mt-1">
                ข้อผิดพลาด: {item.error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const OfflinePendingBadge = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = async () => {
      const workOrderCount = await offlineSyncService.getPendingCount();
      const materialEquipmentCount = await offlineSyncService.getPendingMaterialEquipmentCount();
      const surveyCount = await offlineSyncService.getPendingSurveyCount();
      const surveyImageCount = await offlineSyncService.getPendingSurveyImageCount();
      setCount(workOrderCount + materialEquipmentCount + surveyCount + surveyImageCount);
    };

    updateCount();
    const interval = setInterval(updateCount, 5000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
      <FontAwesomeIcon icon={faCloudArrowUp} size="sm" />
      <span>รอซิงค์ {count}</span>
    </div>
  );
};
