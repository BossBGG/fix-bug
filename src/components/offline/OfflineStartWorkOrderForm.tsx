"use client";

import { useState } from 'react';
import { offlineSyncService } from '@/services/offlineSync';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { showSuccess, showError, showProgress, dismissAlert } from '@/app/helpers/Alert';
import { updateWorkOrderStatus } from '@/app/api/WorkOrderApi';

interface OfflineStartWorkOrderFormProps {
  workOrderId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  children: (props: {
    handleStartWork: () => Promise<void>;
    isProcessing: boolean;
    isOfflineMode: boolean;
  }) => React.ReactNode;
}

export const OfflineStartWorkOrderForm = ({
  workOrderId,
  onSuccess,
  onError,
  children,
}: OfflineStartWorkOrderFormProps) => {
  const { isOnline } = useOnlineStatus();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartWork = async () => {
    setIsProcessing(true);
    showProgress();

    try {
      if (isOnline) {
        const response = await updateWorkOrderStatus(workOrderId, 'O');

        dismissAlert();

        if (response.status === 200) {
          showSuccess('เริ่มปฏิบัติงานสำเร็จ');
          onSuccess?.();
        } else {
          throw new Error('Failed to start work order');
        }
      } else {
        await offlineSyncService.saveWorkOrderStatusOffline(workOrderId, 'O');

        dismissAlert();
        showSuccess(
          'บันทึกการเริ่มปฏิบัติงานในโหมดออฟไลน์สำเร็จ ข้อมูลจะถูกซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต'
        );

        onSuccess?.();
      }
    } catch (error) {
      dismissAlert();
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเริ่มปฏิบัติงาน';
      showError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {children({
        handleStartWork,
        isProcessing,
        isOfflineMode: !isOnline,
      })}
    </>
  );
};

export const useOfflineStartWorkOrder = () => {
  const { isOnline } = useOnlineStatus();
  const [isProcessing, setIsProcessing] = useState(false);

  const startWorkOrder = async (
    workOrderId: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsProcessing(true);
    showProgress();

    try {
      if (isOnline) {
        const response = await updateWorkOrderStatus(workOrderId, 'O');

        dismissAlert();

        if (response.status === 200) {
          showSuccess('เริ่มปฏิบัติงานสำเร็จ');
          return { success: true };
        } else {
          throw new Error('Failed to start work order');
        }
      } else {
        await offlineSyncService.saveWorkOrderStatusOffline(workOrderId, 'O');

        dismissAlert();
        showSuccess(
          'บันทึกการเริ่มปฏิบัติงานในโหมดออฟไลน์สำเร็จ ข้อมูลจะถูกซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต'
        );

        return { success: true };
      }
    } catch (error) {
      dismissAlert();
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเริ่มปฏิบัติงาน';
      showError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    startWorkOrder,
    isProcessing,
    isOnline,
  };
};
