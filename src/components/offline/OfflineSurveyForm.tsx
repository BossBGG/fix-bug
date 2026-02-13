"use client";

import { useState } from 'react';
import { offlineSyncService } from '@/services/offlineSync';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { showSuccess, showError, showProgress, dismissAlert } from '@/app/helpers/Alert';
import { updateWorkOrderSurvey } from '@/app/api/WorkOrderSurveyApi';
import { Survey } from '@/types';

interface OfflineSurveyFormProps {
  surveyId: string;
  onSuccess?: (id: string) => void;
  onError?: (error: Error) => void;
  children: (props: {
    handleSubmit: (data: Survey) => Promise<void>;
    isSaving: boolean;
    isOfflineMode: boolean;
  }) => React.ReactNode;
}

export const OfflineSurveyForm = ({
  surveyId,
  onSuccess,
  onError,
  children,
}: OfflineSurveyFormProps) => {
  const { isOnline } = useOnlineStatus();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (data: Survey) => {
    setIsSaving(true);
    showProgress();

    try {
      if (isOnline) {
        const response = await updateWorkOrderSurvey(surveyId, data);

        dismissAlert();

        if (response.status === 200 || response.status === 201) {
          showSuccess('บันทึกข้อมูลสำเร็จ');
          onSuccess?.(surveyId);
        } else {
          throw new Error('Failed to save survey');
        }
      } else {
        const offlineId = await offlineSyncService.saveSurveyOffline(
          surveyId,
          data
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

export const useOfflineSurveyForm = () => {
  const { isOnline } = useOnlineStatus();
  const [isSaving, setIsSaving] = useState(false);

  const saveSurvey = async (
    surveyId: string,
    data: Survey
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    setIsSaving(true);
    showProgress();

    try {
      if (isOnline) {
        const response = await updateWorkOrderSurvey(surveyId, data);

        dismissAlert();

        if (response.status === 200 || response.status === 201) {
          showSuccess('บันทึกข้อมูลสำเร็จ');
          return {
            success: true,
            id: surveyId,
          };
        } else {
          throw new Error('Failed to save survey');
        }
      } else {
        const offlineId = await offlineSyncService.saveSurveyOffline(
          surveyId,
          data
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
    saveSurvey,
    isSaving,
    isOnline,
  };
};
