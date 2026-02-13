import api, { ApiResponse } from "@/app/api/Api";
import { TableListApi, TableResponse, ListTableData } from "@/app/api/TableApiHelper";
import axios from "axios";
import type { NotificationObj, NotificationType, NotificationSortField, SortOrder, PaginatedResponse } from "@/types/notification";

export type { NotificationObj } from "@/types/notification";

export interface NotificationFilterParams extends ListTableData {
  type?: NotificationType;
  category?: 'SURVEY' | 'WORKORDER';
  isRead?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  view?: 'ALL' | 'SELF';
  sortBy?: NotificationSortField;
  sortOrder?: SortOrder;
}


// Real API implementation


export const NotificationList: TableListApi<NotificationObj> = {
  callApi: (data: ListTableData) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const filterData = data as NotificationFilterParams;

    const params: any = {
      page: filterData.page,
      limit: filterData.limit,
    };

    if (filterData.search) params.search = filterData.search;
    if (filterData.type) params.type = filterData.type;
    if (filterData.category) params.category = filterData.category;
    if (filterData.isRead !== undefined) params.isRead = filterData.isRead;
    if (filterData.dateFrom) params.dateFrom = filterData.dateFrom;
    if (filterData.dateTo) params.dateTo = filterData.dateTo;
    if (filterData.view) params.view = filterData.view;
    if (filterData.sortBy) params.sortBy = filterData.sortBy;
    if (filterData.sortOrder) params.sortOrder = filterData.sortOrder;

    return Promise.resolve({
      api: api.get<PaginatedResponse<NotificationObj>>('/v1/push-notifications/history', { 
        params,
        cancelToken: source.token 
      }).then(response => {
        // Map backend fields to frontend fields
        const mappedData = response.data.data.map((item: any) => ({
          ...item,
          type: item.notificationType,
          message: item.body || item.title,
        }));
        
        return {
          data: {
          status_code: 200,
          message: 'Success',
          data: {
            items: mappedData,
            data: mappedData,
            meta: {
              limit: response.data.limit,
              page: response.data.page,
              totalCount: response.data.total,
            },
            pagination: {
              limit: response.data.limit,
              page: response.data.page,
              totalCount: response.data.total,
            },
            total: response.data.total,
            draw: 1,
            limit: response.data.limit,
            page: response.data.page,
          },
          error: undefined,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      }),
      cancelToken: source,
    });
  },
};


export const markAsRead = async (id: string): Promise<ApiResponse> => {
  return api.post(`/v1/push-notifications/mark-read/${id}`);
};

export const deleteNotification = async (id: string): Promise<ApiResponse> => {
  return api.delete(`/v1/push-notifications/${id}`);
};

export const deleteMultipleNotifications = async (ids: string[]): Promise<ApiResponse> => {
  return api.post('/v1/push-notifications/bulk-delete', { notificationIds: ids });
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get<{ count: number }>('/v1/push-notifications/unread-count');
  return (response.data as any).count || 0;
};

export const getLatestUnread = async (limit: number = 5): Promise<NotificationObj[]> => {
  const response = await api.get<PaginatedResponse<NotificationObj>>('/v1/push-notifications/history', {
    params: { isRead: false, limit, page: 1, sortBy: 'sentAt', sortOrder: 'desc' }
  });
  const data = (response.data as any).data || [];
  // Map backend fields to frontend fields
  return data.map((item: any) => ({
    ...item,
    type: item.notificationType,  // Map notificationType → type
    message: item.body || item.title,  // Map body → message
  }));
};

export const bulkMarkAsRead = async (notificationIds: string[]): Promise<ApiResponse> => {
  return api.post('/v1/push-notifications/bulk-mark-read', { notificationIds });
};

export const markAllAsRead = async (): Promise<ApiResponse> => {
  return api.post('/v1/push-notifications/mark-all-read');
};
