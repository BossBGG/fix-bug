"use client";

import { useState } from 'react';
import { offlineSyncService } from '@/services/offlineSync';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { showSuccess, showError, showProgress, dismissAlert } from '@/app/helpers/Alert';
import { DraftWorkOrder, updateWorkOrder } from '@/app/api/WorkOrderApi';
import { WorkOrderObj } from '@/types';

interface OfflineWorkOrderFormProps {
  workOrderData: Partial<WorkOrderObj>;
  isEdit?: boolean;
  workOrderId?: string;
  onSuccess?: (id: string) => void;
  onError?: (error: Error) => void;
  children: (props: {
    handleSubmit: (data: any) => Promise<void>;
    isSaving: boolean;
    isOfflineMode: boolean;
  }) => React.ReactNode;
}

export const OfflineWorkOrderForm = ({
  workOrderData,
  isEdit = false,
  workOrderId,
  onSuccess,
  onError,
  children,
}: OfflineWorkOrderFormProps) => {
  const { isOnline } = useOnlineStatus();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    showProgress();

    try {
      if (isOnline) {
        let response;

        if (isEdit && workOrderId) {
          response = await updateWorkOrder(workOrderId, data);
        } else {
          response = await DraftWorkOrder(data);
        }

        dismissAlert();

        if (response.status === 200 || response.status === 201) {
          showSuccess('บันทึกข้อมูลสำเร็จ');
          const savedId = response.data?.data?.id || workOrderId || '';
          onSuccess?.(savedId);
        } else {
          throw new Error('Failed to save work order');
        }
      } else {
        const offlineId = await offlineSyncService.saveWorkOrderOffline(
          data,
          isEdit ? 'update' : 'create',
          workOrderId
        );

        dismissAlert();
        showSuccess(
          'บันทึกข้อมูลในโหมดออฟไลน์สำเร็จ ข้อมูลจะถูกซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต'
        );

        onSuccess?.(offlineId);
      }
    } catch (error) {
      dismissAlert();
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      showError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {children({
        handleSubmit,
        isSaving,
        isOfflineMode: !isOnline,
      })}
    </>
  );
};

export const useOfflineWorkOrderForm = () => {
  const { isOnline } = useOnlineStatus();
  const [isSaving, setIsSaving] = useState(false);

  const saveWorkOrder = async (
    data: any,
    options: {
      isEdit?: boolean;
      workOrderId?: string;
    } = {}
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    setIsSaving(true);
    showProgress();

    try {
      if (isOnline) {
        let response;
        let resolvedWorkOrderId = options.workOrderId;

        if (options.isEdit && options.workOrderId) {
          if (options.workOrderId.startsWith('offline-wo-')) {
            const draftResponse = await DraftWorkOrder(data);
            if (draftResponse.status === 200 || draftResponse.status === 201) {
              resolvedWorkOrderId = draftResponse.data?.data?.id;
              if (!resolvedWorkOrderId) {
                throw new Error('Failed to get work order ID from draft');
              }
            } else {
              throw new Error('Failed to create draft work order');
            }
          }
          response = await updateWorkOrder(resolvedWorkOrderId!, data);
        } else {
          response = await DraftWorkOrder(data);
        }

        dismissAlert();

        if (response.status === 200 || response.status === 201) {
          showSuccess('บันทึกข้อมูลสำเร็จ');
          return {
            success: true,
            id: response.data?.data?.id || resolvedWorkOrderId,
          };
        } else {
          throw new Error('Failed to save work order');
        }
      } else {
        const offlineId = await offlineSyncService.saveWorkOrderOffline(
          data,
          options.isEdit ? 'update' : 'create',
          options.workOrderId
        );

        showSuccess(
          'บันทึกข้อมูลในโหมดออฟไลน์สำเร็จ ข้อมูลจะถูกซิงค์เมื่อเชื่อมต่ออินเทอร์เน็ต'
        ).then(() => {
          dismissAlert();
        })

        return {
          success: true,
          id: offlineId,
        };
      }
    } catch (error) {
      dismissAlert();
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      showError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveWorkOrder,
    isSaving,
    isOnline,
  };
};
