import { createTableListApi, TableListApi } from "@/app/api/TableApiHelper";
import api, { ApiResponse } from "@/app/api/Api";
import { MaterialEquipmentObj, MaterialOptionObj, MeterEquipmentService } from "@/types";
import {
  addMaterialType,
  updateMaterialType,
} from "@/app/(pages)/material_equipment/[id]/page";

const path = "v1/material-equipment";
export const MaterialEquipmentList: TableListApi<MaterialEquipmentObj[]> =
  createTableListApi(path, api);

export const MaterialEquipmentListById = (
  id: string
): Promise<
  ApiResponse<{ name: string; materialAndEquipment: MaterialEquipmentObj[] }>
> => {
  return api.get(`${path}/${id}`);
};

export const deleteMaterialEquipment = (id: string): Promise<ApiResponse> => {
  return api.delete(`${path}/${id}`);
};

export const updateActiveStatusMaterial = (id: string, isActive: boolean) => {
  return api.patch(`${path}/${id}`, { isActive });
};

export const getMaterialOptions = (
  search: string = ""
): Promise<ApiResponse<MaterialOptionObj[]>> => {
  return api.get(`v1/material-master?search=${search}`);
};

export const updateActiveStatusEquipment = (id: number, isActive: boolean) => {
  return api.patch(`${path}/${id}`, { isActive });
};

export const createDataMaterials = (data: {
  name: string;
  isActive: boolean;
  materialAndEquipment: {
    name: string;
    code: string;
    quantity: number;
    unit: string;
  }[];
}): Promise<ApiResponse> => {
  return api.post(path, data);
};

export const updateDataMaterials = (
  id: string,
  data: {
    name: string;
    isActive?: boolean;
    addMaterials: addMaterialType[];
    updateMaterials: updateMaterialType[];
    removeMaterialIds?: number[];
  }
): Promise<ApiResponse> => {
  return api.patch(`${path}/${id}`, data);
};


export const getMaterialSets = (
  search: string = "",
  office?: string
): Promise<ApiResponse<{
  items: {
    uuid: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    deletedAt: string | null;
    deletedBy: string | null;
    materialAndEquipment: {
      id: number;
      code: string;
      name: string;
      quantity: number;
      availableStock: number;
      unit: string;
      isActive: boolean;
      price: number;
    }[];
  }[];
}>> => {
  const cleanSearch = (search || "").trim();

  let queryString = `search=${encodeURIComponent(cleanSearch)}`;

  if (office) {
    queryString += `&office=${encodeURIComponent(office)}`;
  }

  const fullUrl = `/v1/material-sets?${queryString}`;

  return api.get(fullUrl);
};


export const getMaterialMaster = (search: string = ""): Promise<ApiResponse<{
  id: number;
  code: string;
  name: string;
  unit: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  availableStock: number;
}[]>> => {
  return api.get(`/v1/material-master?search=${search}`);
};

export const getMeterEquipmentOptions = (
  search: string = "",
  requestCode: string = "s318"
): Promise<ApiResponse<MeterEquipmentService[]>> => {
  return api.get(`/v1/services/meter-equipments`, {
    params: {
      search: search,
      slug: 'equipment',
      requestCode
    }
  })
}

export const getMaterialPriceStock = (
  codes: string[]
): Promise<ApiResponse<{
  code: string;
  price: number;
  availableStock: number | null;
}[]>> => {
  return api.post(`/v1/material-master/price-stock`, { codes });
}
