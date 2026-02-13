import api, { ApiResponse } from "@/app/api/Api";
import {PeaOfficeObj, User} from "@/types";
import { store } from "@/app/redux/store";

export function LoginApi(
  code: string
): Promise<ApiResponse<{ api_token: string; user: User }>> {
  return api.post("/v1/auth/login", { code });
}

export function LoginThaIDApi(
  code: string,
  nonce?: string
): Promise<ApiResponse<{ api_token: string; user: User }>> {
  return api.post("/v1/auth/thaid/login", { code, nonce });
}

export function LoginVendorApi(
  username: string,
  password: string
):Promise<ApiResponse<{ api_token: string; user: User }>> {
  return api.post("/v1/auth/vendor/login", {username,password});
}

export function LogoutApi(): Promise<{ status: number, data: { logoutUrl: string | null } }> {
  return api.post("/v1/auth/logout", {
    token: store.getState().auth.token || null,
  });
}

export function refreshTokenApi(): Promise<{ status: number, data: { api_token: string } }> {
  return api.post("/v1/auth/refresh-token");
}

export function getPeaOfficeList(search: string = ''): Promise<ApiResponse<PeaOfficeObj[]>> {
  return api.get(`/v1/pea-offices/dropdown?search=${search}`);
}

export function updatePeaOffice(data: {username: string, newPeaOffice: string}): Promise<ApiResponse> {
  return api.put('/v1/pea-offices/change', data)
}
