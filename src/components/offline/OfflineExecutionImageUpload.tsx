"use client";

import { useState } from 'react';
import { indexedDBService } from '@/lib/indexedDB';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { uploadWorkOrderExecutionImage } from '@/app/api/WorkOrderApi';

export interface OfflineImageResult {
  success: boolean;
  id: number | string;
  isOffline: boolean;
  preview: string;
  error?: string;
}

const OFFLINE_IMAGE_ID_PREFIX = 'offline-exec-img-';

export const isOfflineExecutionImageId = (id: number | string | null): boolean => {
  if (id === null) return false;
  return typeof id === 'string' && id.startsWith(OFFLINE_IMAGE_ID_PREFIX);
};

export const useOfflineExecutionImageUpload = (workOrderId: string) => {
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

  const uploadImage = async (file: File): Promise<OfflineImageResult> => {
    setIsUploading(true);

    try {
      const base64Data = await fileToBase64(file);

      if (isOnline) {
        const response = await uploadWorkOrderExecutionImage(file);

        if (response?.status === 201 && response?.data?.id) {
          return {
            success: true,
            id: response.data.id as number,
            isOffline: false,
            preview: base64Data,
          };
        } else {
          throw new Error('อัปโหลดไม่สำเร็จ');
        }
      } else {
        const offlineId = `${OFFLINE_IMAGE_ID_PREFIX}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await indexedDBService.saveExecutionImage(
          offlineId,
          workOrderId,
          base64Data,
          file.name,
          file.type
        );

        console.log(`💾 Execution image saved offline: ${offlineId}`);

        return {
          success: true,
          id: offlineId,
          isOffline: true,
          preview: base64Data,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ';
      return {
        success: false,
        id: -1,
        isOffline: !isOnline,
        preview: '',
        error: errorMessage,
      };
    } finally {
      setIsUploading(false);
    }
  };

  const deleteOfflineImage = async (offlineId: string): Promise<void> => {
    if (isOfflineExecutionImageId(offlineId)) {
      await indexedDBService.deleteExecutionImage(offlineId);
      console.log(`🗑️ Offline execution image deleted: ${offlineId}`);
    }
  };

  const getOfflineImages = async (): Promise<{ id: string; preview: string }[]> => {
    const images = await indexedDBService.getExecutionImagesByWorkOrderId(workOrderId);
    return images
      .filter(img => img.status === 'pending')
      .map(img => ({
        id: img.id,
        preview: img.imageData,
      }));
  };

  return {
    uploadImage,
    deleteOfflineImage,
    getOfflineImages,
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
