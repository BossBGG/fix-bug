import api, {ApiResponse} from "@/app/api/Api";
import {OptionApi, RenewableSource, RenewableType, ServiceEquipment, TransformerOptions} from "@/types";

const servicePath = 'v1/services'
// ยี่ห้อ
export const getTransformerBrands = (search: string, requestCode: string): Promise<ApiResponse<TransformerOptions[]>> => {
  return api.get(`${servicePath}/transformer-brands`, {
    params: {
      slug: 'transformer_brand',
      requestCode,
      search
    }
  })
}

// เฟส
export const getTransformerPhase = (search: string, requestCode: string): Promise<ApiResponse<TransformerOptions[]>> => {
  return api.get(`${servicePath}/transformer-phases`, {
    params: {
      slug: 'transformer_phase',
      requestCode,
      search
    }
  })
}

//ประเภท
export const getTransformerType = (search: string, requestCode: string): Promise<ApiResponse<TransformerOptions[]>> => {
  return api.get(`${servicePath}/transformer-types`, {
    params: {
      slug: 'transformer_type',
      requestCode,
      search
    }
  })
}

//ขนาด
export const getTransformerSize = (search: string, requestCode: string): Promise<ApiResponse<TransformerOptions[]>> => {
  return api.get(`${servicePath}/transformer-sizes`, {
    params: {
      slug: 'transformer_size',
      requestCode,
      search
    }
  })
}

//แรงดัน
export const getTransformerVoltage = (search: string, requestCode: string): Promise<ApiResponse<TransformerOptions[]>> => {
  return api.get(`${servicePath}/transformer-voltages`, {
    params: {
      slug: 'transformer_voltage',
      requestCode,
      search
    }
  })
}

export const getServiceEquipmentTypeOptions = (search: string, requestCode: string): Promise<ApiResponse<ServiceEquipment[]>> => {
  return api.get(`/v1/services/equipment-types`, {
    params: {
      search,
      slug:'equipment_type',
      requestCode
    }
  })
}

export const getRenewableSource = (search: string, requestCode: string): Promise<ApiResponse<RenewableSource[]>> => {
  return api.get(`/v1/services/renewable-sources`, {
    params: {
      search,
      slug:'renewable_source',
      requestCode
    }
  })
}

export const getRenewableType = (search: string, requestCode: string): Promise<ApiResponse<RenewableType[]>> => {
  return api.get(`/v1/services/renewable-types`, {
    params: {
      search,
      slug:'renewable_type',
      requestCode
    }
  })
}

export const getRequestService = (search: string, requestCode: string): Promise<ApiResponse<OptionApi[]>> => {
  return api.get(`${servicePath}/request-types`, {
    params: {
      search,
      requestCode,
      slug:'request_service'
    }
  })
}

export const getServiceType = (search: string, requestCode: string): Promise<ApiResponse<OptionApi[]>> => {
  return api.get(`${servicePath}/service-types`, {
    params: {
      search,
      requestCode,
      slug:'request_service_type'
    }
  })
}

export const getServiceGenerator = (officeCode: string) => {
  return api.get(`${servicePath}/generators`, {
    params: {
      pea_code: officeCode
    }
  })
}
