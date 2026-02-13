"use client";

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Card } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWifi, 
  faSync, 
  faCheckCircle, 
  faExclamationTriangle,
  faCloudArrowUp,
  faCircleXmark,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

export const NetworkStatusIndicator = () => {
  const { isOnline, syncStatus, pendingCount, syncNow } = useOnlineStatus();
  const [showIndicator, setShowIndicator] = useState(false);
  const [isManuallyHidden, setIsManuallyHidden] = useState(false);

  useEffect(() => {
    const shouldShow = !isOnline || pendingCount > 0 || syncStatus === 'syncing';
    if (shouldShow && !isManuallyHidden) {
      setShowIndicator(true);
    } else if (!shouldShow) {
      setShowIndicator(false);
      setIsManuallyHidden(false);
    } else if (isManuallyHidden) {
      setShowIndicator(false);
    }
  }, [isOnline, pendingCount, syncStatus]);

  const handleClose = () => {
    setShowIndicator(false);
    setIsManuallyHidden(true);
  };

  if (!showIndicator) return null;

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (syncStatus === 'syncing') return 'bg-yellow-500';
    if (syncStatus === 'error') return 'bg-orange-500';
    if (pendingCount > 0) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (!isOnline) return faCircleXmark;
    if (syncStatus === 'syncing') return faSync;
    if (syncStatus === 'error') return faExclamationTriangle;
    if (pendingCount > 0) return faCloudArrowUp;
    return faCheckCircle;
  };

  const getStatusText = () => {
    if (!isOnline) return 'ออฟไลน์';
    if (syncStatus === 'syncing') return 'กำลังซิงค์ข้อมูล...';
    if (syncStatus === 'error') return 'เกิดข้อผิดพลาดในการซิงค์';
    if (pendingCount > 0) return `รอซิงค์ ${pendingCount} รายการ`;
    return 'ออนไลน์';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <Card className={`${getStatusColor()} text-white p-3 shadow-lg border-none relative`}>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
          aria-label="ปิด"
        >
          <FontAwesomeIcon icon={faXmark} size="sm" />
        </button>
        <div className="flex items-center gap-3 pr-6">
          <FontAwesomeIcon 
            icon={getStatusIcon()} 
            className={syncStatus === 'syncing' ? 'animate-spin' : ''}
            size="lg"
          />
          <div>
            <div className="font-semibold text-sm">{getStatusText()}</div>
            {!isOnline && (
              <div className="text-xs opacity-90">
                ข้อมูลจะถูกบันทึกไว้และซิงค์เมื่อออนไลน์
              </div>
            )}
            {isOnline && pendingCount > 0 && syncStatus !== 'syncing' && (
              <button
                onClick={syncNow}
                className="text-xs underline opacity-90 hover:opacity-100 mt-1"
              >
                ซิงค์ทันที
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export const NetworkStatusBadge = () => {
  const { isOnline, pendingCount } = useOnlineStatus();

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm text-gray-600">
        {isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
      </span>
      {pendingCount > 0 && (
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          รอซิงค์ {pendingCount}
        </span>
      )}
    </div>
  );
};
