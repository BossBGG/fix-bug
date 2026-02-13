import { getToken, onMessage, Messaging, getMessaging } from 'firebase/messaging';
import type { NotificationStrategy } from '@/types/NotificationStrategy';
import { initializeFirebase } from '@/config/firebase';

export class FCMStrategy implements NotificationStrategy {
  private messaging: Messaging | null = null;
  private unsubscribeFn: (() => void) | null = null;
  private messageCallback: ((payload: any) => void) | null = null;

  async initialize(): Promise<void> {
    if (typeof window !== 'undefined') {
      // Unregister old service workers first
      if ('serviceWorker' in navigator) {
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
            console.log('[FCM] Unregistered old SW:', scriptURL);
          }
        }
        
        // Register FCM service worker
        try {
          const registration = await navigator.serviceWorker.register('/pwa-sw.js');
          console.log('[FCM] Service Worker registered:', registration);
          
          // Wait for service worker to be ready
          await navigator.serviceWorker.ready;
          console.log('[FCM] Service Worker ready');
          
          // Wait a bit more for activation
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('[FCM] Service Worker registration failed:', error);
        }
      }
      
      const app = initializeFirebase();
      this.messaging = getMessaging(app);
      
      // Setup onMessage listener immediately
      if (this.messageCallback) {
        this.unsubscribeFn = onMessage(this.messaging, this.messageCallback);
      }
    }
  }

  async subscribe(onMessageCallback: (payload: any) => void): Promise<string | null> {
    if (!this.messaging) throw new Error('FCM not initialized');

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;

      // Wait for service worker to be active
      const registration = await navigator.serviceWorker.ready;
      if (!registration.active) {
        console.log('[FCM] Waiting for SW to activate...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log('[FCM] Getting token...');
      const token = await getToken(this.messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      console.log('[FCM] Token received:', token?.substring(0, 20) + '...');

      // Store callback and setup listener (remove old first)
      if (this.unsubscribeFn) {
        this.unsubscribeFn();
      }
      this.messageCallback = onMessageCallback;
      this.unsubscribeFn = onMessage(this.messaging, (payload) => {
        console.log('[FCM] Message received in strategy:', payload);
        onMessageCallback(payload);
      });
      console.log('[FCM] onMessage listener setup complete');

      return token;
    } catch (error) {
      console.error('[FCM] Subscribe error:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<void> {
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
      this.unsubscribeFn = null;
    }
  }

  onMessage(callback: (payload: any) => void): void {
    if (!this.messaging) return;
    onMessage(this.messaging, callback);
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           'serviceWorker' in navigator;
  }

  getType(): string {
    return 'fcm';
  }
}
