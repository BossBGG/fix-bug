import { createTableListApi, TableListApi } from "@/app/api/TableApiHelper";
import api from "@/app/api/Api";

const path = "v1/service-satisfaction";

export const ServiceSatisfactionList: TableListApi = createTableListApi(path, api);

export const ServiceSatisfactionDetail = (id: string) => {
  return api.get(path + "/" + id);
}
