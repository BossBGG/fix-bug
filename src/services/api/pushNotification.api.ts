import api from '@/app/api/Api';
import type {
  DeviceInfo,
  FCMSubscribeRequest,
  FCMSubscribeResponse,
  UnsubscribeFCMRequest,
  BulkMarkReadResult,
  VapidKeyResponse,
  WebPushSubscribeRequest,
  WebPushSubscribeResponse,
  UnsubscribeWebPushRequest,
} from '@/types/notification';

interface GetHistoryParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'sentAt' | 'notificationType';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  category?: 'SURVEY' | 'WORKORDER';
  isRead?: boolean;
}

interface TestNotificationRequest {
  title: string;
  body: string;
}

interface TestNotificationResponse {
  success: boolean;
  message: string;
}

export const pushNotificationApi = {
  async getConfig() {
    const response = await api.get('/v1/push-notifications/config');
    return response.data;
  },

  async getHistory(params: GetHistoryParams) {
    const response = await api.get('/v1/push-notifications/history', { params });
    return response.data;
  },

  async bulkMarkAsRead(notificationIds: string[]): Promise<BulkMarkReadResult> {
    const response = await api.post<BulkMarkReadResult>('/v1/push-notifications/bulk-mark-read', {
      notificationIds
    });
    return response.data;
  },

  async sendTestNotification(data: TestNotificationRequest): Promise<TestNotificationResponse> {
    const response = await api.post<TestNotificationResponse>('/v1/push-notifications/test', data);
    return response.data;
  },

  async getVapidPublicKey(): Promise<VapidKeyResponse> {
    const response = await api.get<VapidKeyResponse>('/v1/push-notifications/vapid-public-key');
    return response.data;
  },

  async subscribeWebPush(data: WebPushSubscribeRequest): Promise<WebPushSubscribeResponse> {
    const response = await api.post<WebPushSubscribeResponse>('/v1/push-notifications/subscribe', data);
    return response.data;
  },

  async unsubscribeWebPush(data: UnsubscribeWebPushRequest): Promise<void> {
    await api.post('/v1/push-notifications/unsubscribe', data);
  },

  async getWebPushDevices(): Promise<DeviceInfo[]> {
    const response = await api.get<DeviceInfo[]>('/v1/push-notifications/devices');
    return response.data;
  },

  async subscribeFCM(data: FCMSubscribeRequest): Promise<FCMSubscribeResponse> {
    const response = await api.post<FCMSubscribeResponse>('/v1/push-notifications/fcm/subscribe', data);
    return response.data;
  },

  async unsubscribeFCM(data: UnsubscribeFCMRequest): Promise<void> {
    await api.post('/v1/push-notifications/fcm/unsubscribe', data);
  },

  async getFCMTokens(): Promise<DeviceInfo[]> {
    const response = await api.get<DeviceInfo[]>('/v1/push-notifications/fcm/tokens');
    return response.data;
  },

  async getDevices(): Promise<DeviceInfo[]> {
    return this.getWebPushDevices();
  },
};
