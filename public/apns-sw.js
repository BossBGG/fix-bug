self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const title = data.notification?.title || 'แจ้งเตือน';
  const options = {
    body: data.notification?.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data.data,
    requireInteraction: true,
    tag: 'wom-notification',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
