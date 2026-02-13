import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { NotificationState, NotificationObj, NotificationFilters, PaginatedResponse } from '@/types/notification';
import api from '@/app/api/Api';

const initialState: NotificationState = {
  notifications: [],
  latestUnread: [],
  unreadCount: 0,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  loading: false,
  loadingUnread: false,
  loadingCount: false,
  error: null,
  filters: {
    search: '',
    dateFrom: null,
    dateTo: null,
    type: null,
    category: null,
    isRead: null,
  },
}

import * as notificationApi from '@/app/api/NotificationApi';

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (params: Partial<NotificationFilters & { page: number; limit: number }>) => {
    const response = await notificationApi.NotificationList.callApi({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || '',
      type: params.type,
      category: params.category,
      isRead: params.isRead,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
    } as any);
    const result = await response.api;
    return {
      data: result.data.data?.data || [],
      total: result.data.data?.total || 0,
      page: params.page || 1,
      limit: params.limit || 10,
    } as PaginatedResponse<NotificationObj>;
  }
);

export const fetchLatestUnread = createAsyncThunk(
  'notification/fetchLatestUnread',
  async ({ limit = 5, viewMode }: { limit?: number; viewMode?: 'ALL' | 'SELF' }) => {
    // For popup notifications, add viewMode parameter for vendor filtering
    const params: any = { isRead: false, limit: limit || 5, page: 1, sortBy: 'sentAt', sortOrder: 'desc' };
    if (viewMode) params.view = viewMode;
    
    const response = await api.get<PaginatedResponse<NotificationObj>>('/v1/push-notifications/history', {
      params
    });
    const data = (response.data as any).data || [];
    // Map backend fields to frontend fields
    return data.map((item: any) => ({
      ...item,
      type: item.notificationType,  // Map notificationType → type
      message: item.body || item.title,  // Map body → message
    }));
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (viewMode?: 'ALL' | 'SELF') => {
    // For popup notifications, add viewMode parameter for vendor filtering
    const params: any = {};
    if (viewMode) params.view = viewMode;
    
    const response = await api.get<{ count: number }>('/v1/push-notifications/unread-count', { params });
    return (response.data as any).count || 0;
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (id: string) => {
    await notificationApi.markAsRead(id);
    return id;
  }
);

export const markMultipleAsRead = createAsyncThunk(
  'notification/markMultipleAsRead',
  async (ids: string[], { dispatch, getState }) => {
    // Use v1.7.8 bulk API instead of loop
    await notificationApi.bulkMarkAsRead(ids);
    const state = getState() as any;
    const user = state.user;
    const viewMode = user.type === 'VENDOR_USER' ? 'SELF' : 'ALL';
    dispatch(fetchUnreadCount(viewMode));
    return ids;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_: void, { dispatch, getState }) => {
    await notificationApi.markAllAsRead();
    const state = getState() as any;
    const user = state.user;
    const viewMode = user.type === 'VENDOR_USER' ? 'SELF' : 'ALL';
    dispatch(fetchUnreadCount(viewMode));
    return true;
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (id: string) => {
    await notificationApi.deleteNotification(id);
    return id;
  }
);

export const bulkDelete = createAsyncThunk(
  'notification/bulkDelete',
  async (ids: string[]) => {
    await notificationApi.deleteMultipleNotifications(ids);
    return ids;
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<NotificationFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPagination: (state, action: PayloadAction<{ page: number; limit: number }>) => {
      state.pagination.page = action.payload.page
      state.pagination.limit = action.payload.limit
    },
    clearError: (state) => {
      state.error = null
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.data
        state.pagination.total = action.payload.total
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch notifications'
      })
      .addCase(fetchLatestUnread.pending, (state) => {
        state.loadingUnread = true
      })
      .addCase(fetchLatestUnread.fulfilled, (state, action) => {
        state.loadingUnread = false
        state.latestUnread = action.payload
      })
      .addCase(fetchLatestUnread.rejected, (state, action) => {
        state.loadingUnread = false
        state.error = action.error.message || 'Failed to fetch latest unread'
      })
      .addCase(fetchUnreadCount.pending, (state) => {
        state.loadingCount = true
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.loadingCount = false
        state.unreadCount = action.payload
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.loadingCount = false
        state.error = action.error.message || 'Failed to fetch unread count'
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload)
        if (notification) notification.isRead = true
        const unreadNotification = state.latestUnread.find(n => n.id === action.payload)
        if (unreadNotification) unreadNotification.isRead = true
        if (state.unreadCount > 0) state.unreadCount--
      })
      .addCase(markMultipleAsRead.fulfilled, (state, action) => {
        action.payload.forEach(id => {
          const notification = state.notifications.find(n => n.id === id)
          if (notification) notification.isRead = true
          const unreadNotification = state.latestUnread.find(n => n.id === id)
          if (unreadNotification) unreadNotification.isRead = true
        })
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }))
        state.latestUnread = []
        state.unreadCount = 0
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n.id !== action.payload)
        state.latestUnread = state.latestUnread.filter(n => n.id !== action.payload)
      })
      .addCase(bulkDelete.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => !action.payload.includes(n.id))
        state.latestUnread = state.latestUnread.filter(n => !action.payload.includes(n.id))
      })
  },
})

export const { setFilters, setPagination, clearError, resetState } = notificationSlice.actions
export default notificationSlice.reducer
