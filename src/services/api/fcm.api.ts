const API_BASE = '/api/v1';

export interface SubscribeFCMDto {
  fcmToken: string;
  deviceId: string;
  deviceName?: string;
  deviceType?: 'web' | 'ios' | 'android';
}

export interface PollingConfig {
  enabled: boolean;
  intervalSeconds: number;
  minIntervalSeconds: number;
  maxIntervalSeconds: number;
  backgroundIntervalSeconds: number;
  adaptiveEnabled: boolean;
}

export const fcmApi = {
  async subscribe(dto: SubscribeFCMDto) {
    const res = await fetch(`${API_BASE}/push-notifications/fcm/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    return res.json();
  },

  async unsubscribe(deviceId?: string) {
    const res = await fetch(`${API_BASE}/push-notifications/fcm/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });
    return res.json();
  },

  async getTokens() {
    const res = await fetch(`${API_BASE}/push-notifications/fcm/tokens`);
    return res.json();
  },

  async removeToken(id: string) {
    const res = await fetch(`${API_BASE}/push-notifications/fcm/tokens/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async getPollingConfig(): Promise<PollingConfig> {
    const res = await fetch(`${API_BASE}/push-notifications/polling/config`);
    return res.json();
  },
};
