// Push Notification Handler for Service Worker
// v1.7.12 - WOM Frontend

self.addEventListener('push', function(event) {
  console.log('[SW] Push received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'แจ้งเตือน', body: event.data.text() };
    }
  }

  const notification = data.notification || data;
  const payloadData = data.data || {};

  const computeUrl = (d) => {
    if (d && d.actionPath) return d.actionPath;
    if (d && d.actionType === 'WORK_ORDER' && d.actionId) return `/work_order/${d.actionId}`;
    if (d && d.url) return d.url;
    return '/notifications';
  };

  const url = computeUrl(payloadData);
  const title = notification.title || data.title || 'WOM Notification';
  const options = {
    body: notification.body || data.body || data.message || 'คุณมีการแจ้งเตือนใหม่',
    icon: '/icon-wom-192x192.png',
    badge: '/icon-wom-192x192.png',
    data: {
      ...payloadData,
      url,
      workOrderNo: payloadData.workOrderNo,
      notificationId: payloadData.notificationId,
      type: payloadData.type || data.type
    },
    tag: data.tag || 'wom-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        clientList.forEach(function(client) {
          try {
            client.postMessage({
              type: 'PUSH_NOTIFICATION',
              payload: {
                title,
                body: options.body,
                data: options.data,
              }
            });
          } catch (e) {
            // ignore
          }
        });
      })
    ])
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event.notification.data);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  const absoluteUrlToOpen = new URL(urlToOpen, self.location.origin).href;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === absoluteUrlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(absoluteUrlToOpen);
        }
      })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// ============================================
// Push Subscription Change Handler
// ============================================
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');

  event.waitUntil(
    self.registration.showNotification('กรุณาเปิดแอปอีกครั้ง', {
      body: 'เพื่อยืนยัน/ซิงค์การตั้งค่าการแจ้งเตือน',
      icon: '/icon-wom-192x192.png',
      tag: 'resubscribe-required',
      requireInteraction: true,
    })
  );
});
