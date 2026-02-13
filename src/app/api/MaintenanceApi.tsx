import api, { ApiResponse } from "./Api";
import { Maintenance } from "@/types";

export function checkMaintenanceModeApi(): Promise<ApiResponse<Maintenance>> {
  return api.get("v1/config/maintenance");
}
  