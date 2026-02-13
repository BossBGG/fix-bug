import type { NotificationStrategy } from '@/types/NotificationStrategy';
import { WebPushStrategy } from './WebPushStrategy';
import { PollingStrategy } from './PollingStrategy';

export class NotificationStrategyFactory {
  static createStrategy(): NotificationStrategy {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Strategy] Using Polling (development mode)');
      return new PollingStrategy();
    }

    const supportsPush = typeof window !== 'undefined' &&
                         'Notification' in window && 
                         'serviceWorker' in navigator;
    
    if (!supportsPush) {
      console.log('[Strategy] Using Polling (no push support)');
      return new PollingStrategy();
    }

    console.log('[Strategy] Using Web Push');
    return new WebPushStrategy();
  }
}
