import { useState, useCallback } from "react";
import { pushNotificationApi } from "@/services/api/pushNotification.api";
import { initializeFirebase, getMessaging, getToken } from "@/config/firebase";

interface UsePushNotificationReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: (deviceId: string) => Promise<void>;
}

const getDeviceType = (): "desktop" | "mobile" | "tablet" => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua))
    return "tablet";
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  )
    return "mobile";
  return "desktop";
};

const getDeviceName = (): string => {
  const ua = navigator.userAgent;
  const browser =
    ua.match(/(chrome|safari|firefox|edge|opera)/i)?.[0] || "Browser";
  const os = ua.match(/(windows|mac|linux|android|ios)/i)?.[0] || "Unknown";
  return `${browser} on ${os}`;
};

export const usePushNotification = (): UsePushNotificationReturn => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "denied"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    "Notification" in window;

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Push notifications not supported");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (err) {
      setError("Failed to request permission");
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError("Push notifications not supported");
      return false;
    }

    if (permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setLoading(true);
    setError(null);

    try {
      const deviceId = `${getDeviceType()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const app = initializeFirebase();
      const messaging = getMessaging(app);
      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      
      if (!fcmToken) {
        throw new Error('Failed to get FCM token');
      }

      await pushNotificationApi.subscribeFCM({
        deviceId,
        deviceName: getDeviceName(),
        deviceType: 'web',
        fcmToken,
      });

      setIsSubscribed(true);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to subscribe");
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, permission, requestPermission]);

  const unsubscribe = useCallback(async (deviceId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await pushNotificationApi.unsubscribeFCM({ deviceId });
      setIsSubscribed(false);
    } catch (err: any) {
      setError(err.message || "Failed to unsubscribe");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
  };
};
