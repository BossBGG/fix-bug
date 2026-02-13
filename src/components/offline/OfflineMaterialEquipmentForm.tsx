"use client";

import { useState } from 'react';
import { offlineSyncService } from '@/services/offlineSync';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { showSuccess, showError, showProgress, dismissAlert } from '@/app/helpers/Alert';
import { createDataMaterials, updateDataMaterials } from '@/app/api/MaterialEquipmentApi';

interface OfflineMaterialEquipmentFormProps {
  materialEquipmentData: any;
  isEdit?: boolean;
  materialEquipmentId?: string;
  onSuccess?: (id: string) => void;
  onError?: (error: Error) => void;
  children: (props: {
    handleSubmit: (data: any) => Promise<void>;
    isSaving: boolean;
    isOfflineMode: boolean;
  }) => React.ReactNode;
}

export const OfflineMaterialEquipmentForm = ({
  materialEquipmentData,
  isEdit = false,
  materialEquipmentId,
  onSuccess,
  onError,
  children,
}: OfflineMaterialEquipmentFormProps) => {
  const { isOnline } = useOnlineStatus();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    showProgress();

    try {
      if (isOnline) {
        let response;

        if (isEdit && materialEquipmentId) {
          response = await updateDataMaterials(materialEquipmentId, data);
        } else {
          response = await createDataMaterials(data);
        }

        dismissAlert();

        if (response.status === 200 || response.status === 201) {
          showSuccess('บันทึกข้อมูลสำเร็จ');
          const savedId = (response.data as any)?.data?.uuid || materialEquipmentId || '';
          onSuccess?.(savedId);
        } else {
          throw new Error('Failed to save material equipment');
        }
      } else {
        const offlineId = await offlineSyncService.saveMaterialEquipmentOffline(
          data,
          isEdit ? 'update' : 'create',
          materialEquipmentId
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

export const useOfflineMaterialEquipmentForm = () => {
  const { isOnline } = useOnlineStatus();
  const [isSaving, setIsSaving] = useState(false);

  const saveMaterialEquipment = async (
    data: any,
    options: {
      isEdit?: boolean;
      materialEquipmentId?: string;
    } = {}
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    console.log('🔵 saveMaterialEquipment called:', { isOnline, data, options });
    setIsSaving(true);
    showProgress();

    try {
      if (isOnline) {
        console.log('🟢 Online mode - calling API');
        let response;

        if (options.isEdit && options.materialEquipmentId) {
          response = await updateDataMaterials(options.materialEquipmentId, data);
        } else {
          response = await createDataMaterials(data);
        }

        dismissAlert();

        if (response.status === 200 || response.status === 201) {
          showSuccess('บันทึกข้อมูลสำเร็จ');
          return {
            success: true,
            id: (response.data as any)?.data?.uuid || options.materialEquipmentId,
          };
        } else {
          throw new Error('Failed to save material equipment');
        }
      } else {
        console.log('🔴 Offline mode - saving to IndexedDB');
        console.log('Data to save:', data);
        console.log('Action:', options.isEdit ? 'update' : 'create');
        console.log('Material ID:', options.materialEquipmentId);
        
        const offlineId = await offlineSyncService.saveMaterialEquipmentOffline(
          data,
          options.isEdit ? 'update' : 'create',
          options.materialEquipmentId
        );

        console.log('✅ Offline save completed, ID:', offlineId);

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
      console.error('❌ Error in saveMaterialEquipment:', error);
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
    saveMaterialEquipment,
    isSaving,
    isOnline,
  };
};
