import { useState, useEffect } from 'react';

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (permission === 'denied' || permission === 'granted') {
      return permission;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  return {
    permission,
    requestPermission,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    isDefault: permission === 'default',
  };
}
