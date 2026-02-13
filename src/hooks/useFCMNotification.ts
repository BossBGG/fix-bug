import { useWebPushNotification } from '@/hooks/useWebPushNotification';

export function useFCMNotification(onNewNotification?: () => void) {
  const webPush = useWebPushNotification(onNewNotification);

  return {
    strategy: webPush.strategy,
    isSubscribed: webPush.isSubscribed,
    error: webPush.error,
    subscribe: (userId: string, deviceId: string, deviceName?: string) =>
      webPush.subscribe(userId, deviceId, deviceName),
    unsubscribe: () => webPush.unsubscribe(),
    strategyType: webPush.strategyType,
  };
}
