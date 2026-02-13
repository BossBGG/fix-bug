// Notification Types for WOM Frontend v1.7.7

export type NotificationType =
  | 'SURVEY_NEW'
  | 'SURVEY_SUCCESS'
  | 'SURVEY_FAILED'
  | 'SURVEY_CANCELLED'
  | 'WORKORDER_NEW'
  | 'WORKORDER_RECORDED'
  | 'WORKORDER_COMPLETED'
  | 'WORKORDER_APPROVED'
  | 'WORKORDER_REJECTED'
  | 'WORKORDER_CANCELLED'

export interface NotificationObj {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  category: 'SURVEY' | 'WORKORDER'
  workOrderNo?: string
  actionType?: string
  actionId?: string
  actionPath?: string
  surveyId?: string
  isRead: boolean
  sentAt: string
  readAt?: string
  createdAt: string
  updatedAt: string
}

export interface PushSubscriptionJSON {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface VapidKeyResponse {
  publicKey: string
}

export interface WebPushSubscribeRequest {
  deviceId: string
  deviceName?: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface WebPushSubscribeResponse {
  id: string
  userId: string
  deviceId: string
  deviceName?: string
  subscriptionType: string
  lastUsedDate?: string
  createdAt: string
  updatedAt: string
}

export interface UnsubscribeWebPushRequest {
  deviceId?: string
}

export type DeviceType = 'web' | 'ios' | 'android'

export interface DeviceInfo {
  id: string
  deviceId: string
  deviceName?: string
  deviceType?: DeviceType
  subscriptionType?: string
  lastUsedDate?: string
  createdAt: string
}

export interface FCMSubscribeRequest {
  deviceId: string
  deviceName?: string
  deviceType: DeviceType
  fcmToken: string
}

export interface FCMSubscribeResponse {
  id: string
  userId: string
  deviceId: string
  deviceName?: string
  deviceType: DeviceType
  fcmToken: string
  isActive: boolean
  lastUsedDate?: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface NotificationFilters {
  search: string
  dateFrom: string | null
  dateTo: string | null
  type: NotificationType | null
  category: 'SURVEY' | 'WORKORDER' | null
  isRead: boolean | null
}

export interface NotificationState {
  notifications: NotificationObj[]
  latestUnread: NotificationObj[]
  unreadCount: number
  pagination: {
    page: number
    limit: number
    total: number
  }
  loading: boolean
  loadingUnread: boolean
  loadingCount: boolean
  error: string | null
  filters: NotificationFilters
}

export type NotificationSortField = 'createdAt' | 'sentAt' | 'notificationType' | 'title' | 'body'

export type SortOrder = 'asc' | 'desc'

export interface BulkMarkReadResult {
  success: boolean
  marked: number
  failed: number
}

export interface Device {
  id: string
  userId: string
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  endpoint: string
  subscribedAt: string
}

export interface UnsubscribeFCMRequest {
  deviceId?: string
}
