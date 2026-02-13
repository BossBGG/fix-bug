import type { NotificationStrategy } from '@/types/NotificationStrategy';

export class WebPushStrategy implements NotificationStrategy {
  private registration: ServiceWorkerRegistration | null = null;

  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      const scriptURL = registration.active?.scriptURL;
      if (!scriptURL) continue;

      let pathname = '';
      try {
        pathname = new URL(scriptURL).pathname;
      } catch {
        // ignore
      }

      if (pathname === '/sw.js' || pathname === '/firebase-messaging-sw.js') {
        await registration.unregister();
      }
    }

    const reg = await navigator.serviceWorker.register('/pwa-sw.js');
    await navigator.serviceWorker.ready;
    this.registration = reg;
  }

  async subscribe(onMessage: (payload: any) => void): Promise<string | null> {
    if (!this.registration) throw new Error('Not initialized');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    let vapidPublicKey = '';
    try {
      const res = await fetch('/api/v1/push-notifications/vapid-public-key');
      if (res.ok) {
        const data = await res.json();
        vapidPublicKey = data?.publicKey || '';
      }
    } catch {
      // ignore
    }

    if (!vapidPublicKey) {
      vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    }

    const existingSubscription = await this.registration.pushManager.getSubscription();
    const subscription =
      existingSubscription ||
      (await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      }));

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'PUSH_NOTIFICATION') {
        onMessage(event.data.payload);
      }
    });

    return JSON.stringify(subscription);
  }

  async unsubscribe(): Promise<void> {
    if (!this.registration) return;
    const subscription = await this.registration.pushManager.getSubscription();
    await subscription?.unsubscribe();
  }

  onMessage(callback: (payload: any) => void): void {
    // Not used
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  getType(): string {
    return 'webpush';
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
