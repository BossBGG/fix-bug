"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/app/redux/hook";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { pushNotificationApi } from "@/services/api/pushNotification.api";
import { useWebPushNotification } from "@/hooks/useWebPushNotification";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";
import type { DeviceInfo } from "@/types/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faTrash, faDesktop, faMobile, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { showConfirm } from "@/app/helpers/Alert";
import { formatJSDate } from "@/app/helpers/DatetimeHelper";

const NotificationSettings = () => {
  const { setBreadcrumb } = useBreadcrumb();
  const token = useAppSelector((state) => state.auth.token);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({ maxDevices: 5, cleanupDays: 30 });
  const webPush = useWebPushNotification();
  const { permission, requestPermission } = useNotificationPermission();

  const userId = token ? (() => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch {
      return undefined;
    }
  })() : undefined;

  const [isSubscribed, setIsSubscribed] = useState(
    typeof window !== 'undefined' && localStorage.getItem('webpush_subscribed') === 'true'
  );

  useEffect(() => {
    setBreadcrumb(
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <span className="text-gray-700">ตั้งค่า</span>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">การแจ้งเตือน</span>
            </div>
          </li>
        </ol>
      </nav>
    );
  }, [setBreadcrumb]);

  useEffect(() => {
    loadConfig();
    if (isSubscribed) {
      loadDevices();
    }
  }, [isSubscribed]);

  const loadConfig = async () => {
    try {
      const data = await pushNotificationApi.getConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const loadDevices = async () => {
    try {
      setLoading(true);
      const data = await pushNotificationApi.getDevices();
      setDevices(data);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotification = async () => {
    if (isSubscribed) {
      const confirmed = await showConfirm('คุณต้องการปิดการแจ้งเตือนหรือไม่?');
      if (confirmed) {
        await pushNotificationApi.unsubscribeWebPush({});
        localStorage.removeItem('webpush_subscribed');
        localStorage.removeItem('webpush_last_subscribe');
        setDevices([]);
        setIsSubscribed(false);
      }
    } else {
      const result = await requestPermission();
      if (result === 'granted' && userId) {
        const deviceId = localStorage.getItem('device_id') || crypto.randomUUID();
        localStorage.setItem('device_id', deviceId);
        const token = await webPush.subscribe(userId, deviceId, navigator.userAgent);
        
        if (token) {
          localStorage.setItem('webpush_subscribed', 'true');
          setIsSubscribed(true);
          loadDevices();
        } else if (webPush.error === 'DEVICE_LIMIT_REACHED') {
          await showConfirm(
            `คุณมีอุปกรณ์เชื่อมต่อครบจำนวนแล้ว (สูงสุด ${config.maxDevices} เครื่อง)\n` +
            'กรุณาลบอุปกรณ์เก่าก่อนเพิ่มอุปกรณ์ใหม่'
          );
        }
      }
    }
  };

  const handleUnsubscribeDevice = async (deviceId: string) => {
    const confirmed = await showConfirm('คุณต้องการยกเลิกอุปกรณ์นี้หรือไม่?');
    if (confirmed) {
      try {
        await pushNotificationApi.unsubscribeWebPush({ deviceId });
        loadDevices();
        
        const currentDeviceId = localStorage.getItem('device_id');
        if (currentDeviceId === deviceId) {
          localStorage.removeItem('webpush_subscribed');
          localStorage.removeItem('webpush_last_subscribe');
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error('Failed to unsubscribe device:', error);
      }
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'ios':
      case 'android':
        return faMobile;
      case 'web':
        return faDesktop;
      default:
        return faGlobe;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold mb-6">การตั้งค่าการแจ้งเตือน</h1>

        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faBell} className="text-purple-600 text-xl" />
              <div>
                <p className="font-medium text-gray-900">เปิดการแจ้งเตือน</p>
                <p className="text-sm text-gray-500">
                  รับการแจ้งเตือนแบบ real-time เมื่อมีใบสั่งงานใหม่
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSubscribed}
                onChange={handleToggleNotification}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {permission === 'denied' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                การแจ้งเตือนถูกปิดใช้งานในเบราว์เซอร์ กรุณาเปิดการแจ้งเตือนในการตั้งค่าเบราว์เซอร์
              </p>
            </div>
          )}
        </div>

        {isSubscribed && (
          <div>
            <h2 className="text-lg font-semibold mb-4">อุปกรณ์ที่เชื่อมต่อ</h2>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>
            ) : devices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">ไม่มีอุปกรณ์ที่เชื่อมต่อ</div>
            ) : (
              <div className="space-y-3">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FontAwesomeIcon
                        icon={getDeviceIcon(device.deviceType || device.subscriptionType || 'web')}
                        className="text-gray-600 text-xl"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {device.deviceName || 'อุปกรณ์ไม่ระบุชื่อ'}
                        </p>
                        <p className="text-sm text-gray-500">
                          ใช้งานล่าสุด: {device.lastUsedDate ? formatJSDate(new Date(device.lastUsedDate), 'dd/MM/yyyy HH:mm') : 'ไม่ทราบ'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnsubscribeDevice(device.deviceId)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      <span>ยกเลิก</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">ข้อมูลเพิ่มเติม</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• คุณสามารถเชื่อมต่อได้สูงสุด {config.maxDevices} อุปกรณ์</li>
            <li>• การแจ้งเตือนจะถูกส่งไปยังทุกอุปกรณ์ที่เชื่อมต่อ</li>
            <li>• อุปกรณ์ที่ไม่ได้ใช้งานเกิน {config.cleanupDays} วันจะถูกลบอัตโนมัติ</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
