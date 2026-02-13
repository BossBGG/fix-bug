import api, {ApiResponse} from "@/app/api/Api";
import {Survey} from "@/types";
import {createTableListApi} from "@/app/api/TableApiHelper";

const path = '/v1/work-order-survey'
export const getWorkOrderSurveyById = (id: string): Promise<ApiResponse<Survey>> => {
  return api.get(`${path}/${id}`)
}

export const workOrderSurveyHistoryList = (workOrderId: string) =>
  createTableListApi(`${path}/${workOrderId}/logs`, api);

export const updateWorkOrderSurvey = (id: string, workOrderSurvey: Survey): Promise<ApiResponse<Survey>> => {
  return api.patch(`${path}/${id}`, workOrderSurvey)
}

export const uploadWorkOrderSurveyImage = (file: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`v1/minio/survey-result-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
