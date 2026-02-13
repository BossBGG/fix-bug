import api, {ApiResponse} from "@/app/api/Api";
import {PeaOrganize, ServiceType} from "@/types";

export const getServiceTypeOptions = (): Promise<ApiResponse<{serviceGroups: ServiceType[]}>> => {
  return api.get('v1/services/tree')
}

export const getPeaOfficeOptions = ():Promise<ApiResponse<{data: PeaOrganize[]}>> => {
  return api.get('v1/pea-offices/tree')
}
