import { useState, useEffect, useCallback } from 'react';
import { NotificationStrategyFactory } from '@/services/notification/NotificationStrategyFactory';
import type { NotificationStrategy } from '@/types/NotificationStrategy';
import { useAppSelector } from '@/app/redux/hook';
import { pushNotificationApi } from '@/services/api/pushNotification.api';

export function useWebPushNotification(onNewNotification?: () => void) {
  const [strategy, setStrategy] = useState<NotificationStrategy | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(
    typeof window !== 'undefined' && localStorage.getItem('webpush_subscribed') === 'true'
  );
  const [error, setError] = useState<string | null>(null);
  const userToken = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    const initStrategy = async () => {
      try {
        console.log('[WebPush] Initializing strategy...');
        const selectedStrategy = NotificationStrategyFactory.createStrategy();
        await selectedStrategy.initialize();
        console.log('[WebPush] Strategy initialized:', selectedStrategy.getType());
        setStrategy(selectedStrategy);
      } catch (err) {
        console.error('[WebPush] Init error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      }
    };

    initStrategy();
  }, []);

  const subscribe = useCallback(
    async (_userId: string | undefined, deviceId: string, deviceName?: string) => {
      if (!strategy) {
        setError('Strategy not initialized');
        return null;
      }

      if (!navigator.onLine) {
        console.log('[WebPush] Offline mode detected, skipping push notification subscription');
        setError('System is offline, cannot subscribe to push notifications');
        return null;
      }

      try {
        if (strategy.getType() === 'polling') {
          const result = await strategy.subscribe((payload) => {
            console.log('[Notification] Received:', payload);

            if (onNewNotification) {
              onNewNotification();
            }

            window.dispatchEvent(new CustomEvent('notification-received'));
          });

          if (!result) {
            setError('Failed to subscribe');
            return null;
          }

          localStorage.setItem('webpush_last_subscribe', Date.now().toString());
          localStorage.setItem('webpush_subscribed', 'true');
          setIsSubscribed(true);
          return result;
        }

        const subscriptionJson = await strategy.subscribe((payload) => {
          console.log('[Notification] Received:', payload);

          if (Notification.permission === 'granted') {
            try {
              const notification = new Notification(payload.title || payload.notification?.title || 'แจ้งเตือน', {
                body: payload.body || payload.notification?.body || '',
                icon: '/favicon.ico',
                data: payload.data,
                requireInteraction: true,
                tag: 'wom-notification',
              });

              notification.onclick = () => {
                window.focus();
                notification.close();
              };
            } catch (err) {
              console.error('[Notification] Error creating notification:', err);
            }
          }

          if (onNewNotification) {
            onNewNotification();
          }

          window.dispatchEvent(new CustomEvent('notification-received'));
        });

        if (!subscriptionJson) {
          setError('Failed to subscribe');
          return null;
        }

        const subscription = JSON.parse(subscriptionJson);

        await pushNotificationApi.subscribeWebPush({
          deviceId,
          deviceName: deviceName || navigator.userAgent,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys?.p256dh,
            auth: subscription.keys?.auth,
          },
        });

        localStorage.setItem('webpush_last_subscribe', Date.now().toString());
        localStorage.setItem('webpush_subscribed', 'true');
        setIsSubscribed(true);

        return subscriptionJson;
      } catch (err) {
        const maybeAny = err as any;
        if (
          maybeAny?.response?.status === 400 &&
          String(maybeAny?.response?.data?.message || '').includes('Device limit reached')
        ) {
          setError('DEVICE_LIMIT_REACHED');
          return null;
        }

        const errorMsg = err instanceof Error ? err.message : 'Subscription failed';
        setError(errorMsg);
        return null;
      }
    },
    [strategy, onNewNotification]
  );

  useEffect(() => {
    const autoSyncSubscription = async () => {
      if (!userToken || !strategy) return;

      if (!navigator.onLine) {
        console.log('[WebPush] Offline mode detected, skipping auto-sync subscription');
        return;
      }

      if (strategy.getType() !== 'webpush') return;

      if (Notification.permission !== 'granted') {
        return;
      }

      const lastSubscribe = localStorage.getItem('webpush_last_subscribe');
      const daysSince = lastSubscribe
        ? (Date.now() - parseInt(lastSubscribe)) / (1000 * 60 * 60 * 24)
        : 999;

      try {
        const payload = JSON.parse(atob(userToken.split('.')[1]));
        const userId = payload.sub;
        const deviceId = localStorage.getItem('device_id') || crypto.randomUUID();
        localStorage.setItem('device_id', deviceId);

        if (!userId) return;

        console.log('[WebPush] Auto-sync subscription (days since:', daysSince.toFixed(2), ')');
        await subscribe(userId, deviceId, navigator.userAgent);
      } catch (err) {
        console.error('[WebPush] Auto-sync error:', err);
      }
    };

    autoSyncSubscription();
  }, [userToken, strategy, subscribe]);

  const unsubscribe = useCallback(async (deviceId?: string) => {
    if (!strategy) return;

    try {
      await strategy.unsubscribe();

      if (strategy.getType() === 'webpush') {
        await pushNotificationApi.unsubscribeWebPush({ deviceId });
      }

      setIsSubscribed(false);
      localStorage.removeItem('webpush_subscribed');
      localStorage.removeItem('webpush_last_subscribe');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unsubscribe failed');
    }
  }, [strategy]);

  return {
    strategy,
    isSubscribed,
    error,
    subscribe,
    unsubscribe,
    strategyType: strategy?.getType(),
  };
}
