"use client";

import { useState } from 'react';
import { offlineSyncService } from '@/services/offlineSync';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { showSuccess, showError, showProgress, dismissAlert } from '@/app/helpers/Alert';
import { cancelWorkOrder } from '@/app/api/WorkOrderApi';

interface OfflineCancelWorkOrderFormProps {
  workOrderId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  children: (props: {
    handleCancel: (note: string) => Promise<void>;
    isCancelling: boolean;
    isOfflineMode: boolean;
  }) => React.ReactNode;
}

export const OfflineCancelWorkOrderForm = ({
  workOrderId,
  onSuccess,
  onError,
  children,
}: OfflineCancelWorkOrderFormProps) => {
  const { isOnline } = useOnlineStatus();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async (note: string) => {
    setIsCancelling(true);
    showProgress();

    try {
      if (isOnline) {
        const response = await cancelWorkOrder(workOrderId, { note });
        dismissAlert();

        if (response.status === 200) {
          if (response.data.error) {
            showError(response.data.message || 'เกิดข้อผิดพลาดในการยกเลิกใบสั่งงาน');
            onError?.(new Error(response.data.message || 'Cancel failed'));
          } else {
            showSuccess('ยกเลิกใบสั่งงานสำเร็จ');
            onSuccess?.();
          }
        } else {
          throw new Error('Failed to cancel work order');
        }
      } else {
        await offlineSyncService.saveCancelWorkOrderOffline(workOrderId, { note });
        dismissAlert();
        showSuccess(
          'บันทึกการยกเลิกใบสั่งงานในโหมดออฟไลน์สำเร็จ ข้อมูลจะถูกซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต'
        );
        onSuccess?.();
      }
    } catch (error) {
      dismissAlert();
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการยกเลิกใบสั่งงาน';
      showError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      {children({
        handleCancel,
        isCancelling,
        isOfflineMode: !isOnline,
      })}
    </>
  );
};

export const useOfflineCancelWorkOrder = () => {
  const { isOnline } = useOnlineStatus();
  const [isCancelling, setIsCancelling] = useState(false);

  const cancelWorkOrderOffline = async (
    workOrderId: string,
    note: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsCancelling(true);
    showProgress();

    try {
      if (isOnline) {
        const response = await cancelWorkOrder(workOrderId, { note });
        dismissAlert();

        if (response.status === 200) {
          if (response.data.error) {
            showError(response.data.message || 'เกิดข้อผิดพลาดในการยกเลิกใบสั่งงาน');
            return {
              success: false,
              error: response.data.message || 'Cancel failed',
            };
          } else {
            showSuccess('ยกเลิกใบสั่งงานสำเร็จ');
            return { success: true };
          }
        } else {
          throw new Error('Failed to cancel work order');
        }
      } else {
        await offlineSyncService.saveCancelWorkOrderOffline(workOrderId, { note });
        dismissAlert();
        showSuccess(
          'บันทึกการยกเลิกใบสั่งงานในโหมดออฟไลน์สำเร็จ ข้อมูลจะถูกซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต'
        );
        return { success: true };
      }
    } catch (error) {
      dismissAlert();
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการยกเลิกใบสั่งงาน';
      showError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    cancelWorkOrderOffline,
    isCancelling,
    isOnline,
  };
};
