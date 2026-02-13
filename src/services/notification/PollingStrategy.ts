import type { NotificationStrategy } from '@/types/NotificationStrategy';

export class PollingStrategy implements NotificationStrategy {
  private intervalId: NodeJS.Timeout | null = null;
  private config: any = null;
  private callback: ((payload: any) => void) | null = null;

  async initialize(): Promise<void> {
    try {
      const response = await fetch('/api/v1/push-notifications/polling/config');

      if (!response.ok) {
        this.config = {
          intervalSeconds: 30,
          backgroundIntervalSeconds: 300,
        };
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        this.config = {
          intervalSeconds: 30,
          backgroundIntervalSeconds: 300,
        };
        return;
      }

      this.config = await response.json();
    } catch {
      this.config = {
        intervalSeconds: 30,
        backgroundIntervalSeconds: 300,
      };
    }
  }

  async subscribe(onMessageCallback: (payload: any) => void): Promise<string | null> {
    this.callback = onMessageCallback;
    this.startPolling();
    return 'polling-active';
  }

  async unsubscribe(): Promise<void> {
    this.stopPolling();
    this.callback = null;
  }

  onMessage(callback: (payload: any) => void): void {
    this.callback = callback;
  }

  isSupported(): boolean {
    return true;
  }

  getType(): string {
    return 'polling';
  }

  private startPolling(): void {
    if (!this.config) return;

    const poll = async () => {
      try {
        const response = await fetch('/api/v1/push-notifications/unread-count');
        const { count } = await response.json();
        
        if (count > 0 && this.callback) {
          this.callback({ unreadCount: count });
        }
      } catch (error) {
        console.error('[Polling] Error:', error);
      }
    };

    const interval = document.hidden 
      ? this.config.backgroundIntervalSeconds * 1000
      : this.config.intervalSeconds * 1000;

    this.intervalId = setInterval(poll, interval);
    poll();
  }

  private stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
