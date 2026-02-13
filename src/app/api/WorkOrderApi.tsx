import api, { ApiResponse } from "@/app/api/Api";
import { createTableListApi } from "@/app/api/TableApiHelper";
import {
  WorkOrderObj,
  BusinessTypeObj,
  Event,
  MainWorkCenter,
  WorkerOptionObj,
  Options,
  WorkOrderRelation,
  CustomerRequest, WorkOrderDashBoardSummary, CancelWorkOrderRequest, ActivityPMOptionObj,
  VendorOptionObj,
} from "@/types";

export const JobPriorityOptions: Options[] = [
  { value: "1", label: "สำคัญมาก (24 ชม.)" },
  { value: "2", label: "สำคัญปานกลาง (2 วัน)" },
  { value: "3", label: "ปกติ (5 วัน)" },
];

export const groupWorkerOptions: Options[] = [
  { label: "พนักงาน PEA", value: "peaUser" },
  { label: "Vendor", value: "vendorUser" },
];

const path = "v1/work-orders";
export const ServiceRequestRefListApi = createTableListApi(
  `v1/service-requests`,
  api
);

export const WorkOrderRefListApi = createTableListApi(path, api);

export const WorkOrderListByOffice = (office_id: string) =>
  createTableListApi(`v1/pea-offices/${office_id}/work-orders`, api);

export const WorkOrderList = createTableListApi(`${path}/my`, api);

export const VendorWorkOrderList = createTableListApi(`${path}/vendor/my`,api)

export const DraftWorkOrder = (
  data: any
): Promise<ApiResponse<WorkOrderObj>> => {
  return api.post(`${path}/draft`, data);
};

export const DraftWorkOrderOffline = (
  data: any
): Promise<ApiResponse<WorkOrderObj>> => {
  return api.post(`${path}/draft/offline`, data);
};

export const CreateBulkWorkOrder = (
  data: any
): Promise<ApiResponse<WorkOrderObj>> => {
  return api.post(`${path}/bulk`, data);
};

export const updateWorkOrder = (
  id: string,
  data: WorkOrderObj
): Promise<ApiResponse> => {
  return api.put(`${path}/${id}`, data);
};

export const executeWorkOrder = (
  id: string,
  data: WorkOrderObj
): Promise<ApiResponse> => {
  return api.post(`${path}/${id}/execution`, data);
};

export const getWorkOrderDetailById = (
  id: string,
  isExecute: boolean
): Promise<ApiResponse<WorkOrderObj>> => {
  const detailPath = `${path}/${id}`;
  if (isExecute) {
    return api.get(`${detailPath}/execution`);
  }
  return api.get(detailPath);
};

export const getServiceRequestDetail = (
  custReqNo: string
): Promise<ApiResponse<{ data: CustomerRequest[] }>> => {
  return api.get(`v1/service-requests?search=${custReqNo}`);
};

export const updateWorkOrderStatus = (
  id: string,
  status: string
): Promise<ApiResponse> => {
  return api.put(`${path}/${id}/status`, { workOrderStatusCode: status });
};

export const getBusinessType = (
  search: string
): Promise<ApiResponse<BusinessTypeObj[]>> => {
  return api.get(`v1/business-types`, {
    params: { search },
  });
};

export const getEventOptions = (
  search: string
): Promise<ApiResponse<Event[]>> => {
  return api.get(`v1/activity-types`, {
    params: { search },
  });
};

export const getMainWorkCenterOptions = (
  search: string,
  type?: string
): Promise<ApiResponse<MainWorkCenter[]>> => {
  return api.get(`/v1/main-work-centers`, {
    params: { search, type },
  });
};

export const getWorkerOptions = (
  search: string
): Promise<ApiResponse<WorkerOptionObj[]>> => {
  return api.get(`/v1/users/workers`, {
    params: { search },
  });
};

export const getActivityPMOptions = (
  search: string
): Promise<ApiResponse<ActivityPMOptionObj[]>> => {
  return api.get(`/v1/activity-pm`, {
    params: { search },
  });
};

export const getVendorOptions = (
  search: string
): Promise<ApiResponse<VendorOptionObj[]>> => {
  return api.get('v1/vendors', {
    params: { search},
  });
};

export const cancelWorkOrder = (id: string, data: CancelWorkOrderRequest): Promise<ApiResponse> => {
  return api.delete(`${path}/${id}`, { data });
};

export const uploadWorkOrderExecutionImage = (
  file: File
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("execution-image", file);

  return api.post(`v1/minio/execution-images`, formData);
};

export const uploadWorkOrderExecutionAttachment = (
  file: File
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("execution-attachment", file);

  return api.post(`v1/minio/execution-attachments`, formData);
};

export const getWorkOrderRelationships = (
  id: string
): Promise<ApiResponse<WorkOrderRelation>> => {
  return api.get(`${path}/${id}/relationships`);
};

export const referWorkOrderByRequestNo = (
  id: string,
  customerRequestNo: string
): Promise<ApiResponse> => {
  return api.put(`${path}/${id}`, { customerRequestNo });
};

export const referWorkOrderByMainWorkOrder = (
  id: string,
  workOrderParentId: string
): Promise<ApiResponse> => {
  return api.put(`${path}/${id}`, { workOrderParentId });
};

export const getWorkOrdersByMonth = (
  month: number,
  year: number,
  view: string
): Promise<
  ApiResponse<{
    calendar: {
      date: string;
      workOrders: {
        count: number;
        workType: string;
        appointmentDate: string | Date;
        customerAddress: string;
        customerName: string;
        customerMobileNo: string;
        workOrderNo: string;
        workTypeName: string;
      }[];
    }[];
  }>
> => {
  return api.get(`v1/calendar/work-orders`, {
    params: { view, month, year }
  });
};

export const getWorkOrdersByDay = (
  date: string,
  view: string
): Promise<ApiResponse<{ workOrders: WorkOrderObj[] }>> => {
  return api.get(`v1/calendar/work-orders/day/${date}`, {
    params: { view },
  });
};

export const completeWorkByWorkOrderNo = (workOrderNo: string): Promise<ApiResponse> => {
  return api.put(`${path}/${workOrderNo}/finish`, {
    finishedAt: new Date().toISOString()
  })
}

export const completeWorkBulk = (workOrderNo: string[]): Promise<ApiResponse<{failedCount: number}>> => {
  return api.put(`${path}/bulk/finish`, {
    workOrderIds: workOrderNo,
    finishedAt: new Date().toISOString()
  })
}

export const getDashboardSummary = (view: "SELF" | "ALL" = "ALL"): Promise<ApiResponse<WorkOrderDashBoardSummary>> => {
  return api.get(`/v1/dashboard/summary?view=${view.toLowerCase()}`);
}

export const cancellableStatuses = ['W', 'M', 'O', 'K', 'B', 'J', 'X'];
