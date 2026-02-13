"use client";

import { useState } from 'react';
import { indexedDBService } from '@/lib/indexedDB';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { uploadWorkOrderExecutionAttachment } from '@/app/api/WorkOrderApi';

export interface OfflineAttachmentResult {
  success: boolean;
  id: number | string;
  isOffline: boolean;
  error?: string;
}

const OFFLINE_ATTACHMENT_ID_PREFIX = 'offline-exec-attach-';

export const isOfflineExecutionAttachmentId = (id: number | string | null): boolean => {
  if (id === null) return false;
  return typeof id === 'string' && id.startsWith(OFFLINE_ATTACHMENT_ID_PREFIX);
};

export const useOfflineExecutionAttachmentUpload = (workOrderId: string) => {
  const { isOnline } = useOnlineStatus();
  const [isUploading, setIsUploading] = useState(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadAttachment = async (file: File): Promise<OfflineAttachmentResult> => {
    setIsUploading(true);

    try {
      const base64Data = await fileToBase64(file);

      if (isOnline) {
        const response = await uploadWorkOrderExecutionAttachment(file);

        if (response?.status === 201 && response?.data?.id) {
          return {
            success: true,
            id: response.data.id as number,
            isOffline: false,
          };
        } else {
          throw new Error('อัปโหลดไม่สำเร็จ');
        }
      } else {
        const offlineId = `${OFFLINE_ATTACHMENT_ID_PREFIX}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await indexedDBService.saveExecutionAttachment(
          offlineId,
          workOrderId,
          base64Data,
          file.name,
          file.type
        );

        console.log(`💾 Execution attachment saved offline: ${offlineId}`);

        return {
          success: true,
          id: offlineId,
          isOffline: true,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์';
      return {
        success: false,
        id: -1,
        isOffline: !isOnline,
        error: errorMessage,
      };
    } finally {
      setIsUploading(false);
    }
  };

  const deleteOfflineAttachment = async (offlineId: string): Promise<void> => {
    if (isOfflineExecutionAttachmentId(offlineId)) {
      await indexedDBService.deleteExecutionAttachment(offlineId);
      console.log(`🗑️ Offline execution attachment deleted: ${offlineId}`);
    }
  };

  const getOfflineAttachments = async (): Promise<{ id: string; fileName: string; mimeType: string }[]> => {
    const attachments = await indexedDBService.getExecutionAttachmentsByWorkOrderId(workOrderId);
    return attachments
      .filter(attach => attach.status === 'pending')
      .map(attach => ({
        id: attach.id,
        fileName: attach.fileName,
        mimeType: attach.mimeType,
      }));
  };

  return {
    uploadAttachment,
    deleteOfflineAttachment,
    getOfflineAttachments,
    isUploading,
    isOnline,
  };
};

export const base64ToFile = (base64: string, fileName: string, mimeType: string): File => {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new File([ab], fileName, { type: mimeType });
};
