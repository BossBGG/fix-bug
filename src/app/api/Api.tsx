import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {showError, showSuccess} from "@/app/helpers/Alert";
import {store} from "@/app/redux/store";
import {refreshTokenApi} from "@/app/api/LoginApi";
import {clearToken, setToken} from "@/app/redux/slices/AuthSlice";
import {clearUserProfile} from "@/app/redux/slices/UserSlice";

export type ApiResponse<T = null> = AxiosResponse<BaseApiResponse<T>>;

interface BaseApiResponse<T> {
  status_code: number;
  message: string;
  data: T | null;
  error?: Array<string> | string;
  id?: number;
}

// Refresh Token Management
let isRefreshing = false;
let refreshTokenPromise: Promise<string> | null = null;

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_API_BASE_URL || "/api",
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const accessToken = store.getState().auth.token || null;
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    const skipOfflineInterceptorPaths = [
      '/v1/push-notifications/subscribe',
      '/v1/material-equipment',
    ]

    const shouldSkipOfflineInterceptor = skipOfflineInterceptorPaths.some(path => 
      originalRequest?.url?.includes(path)
    );

    // Handle Offline POST requests (Background Sync)
    if (error.code === "ERR_NETWORK" && ["POST", "PUT"].includes(originalRequest!.method!.toUpperCase()) && !shouldSkipOfflineInterceptor) {
      showSuccess(
        "บันทึกข้อมูลแบบ Offline แล้ว",
        "ระบบจะทำการส่งข้อมูลเมื่อมีอินเทอร์เน็ต"
      );
      return Promise.resolve({
        data: { success: true, isOffline: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config: originalRequest,
      } as AxiosResponse);
    }

    if (error.response?.status === 401 && !originalRequest!.url!.includes('/refresh-token')) {
      // กรณีที่ 1: ยังไม่มีการ Refresh
      if (!isRefreshing) {
        isRefreshing = true;

        refreshTokenPromise = refreshTokenApi()
          .then((response) => {
            const newAccessToken = response.data.api_token;
            store.dispatch(setToken(newAccessToken));
            return newAccessToken;
          })
          .catch((refreshError) => {
            // Failure Path: Refresh Token ล้มเหลว
            clearAuthAndLogout(refreshError);
            throw refreshError;
          })
          .finally(() => {
            isRefreshing = false;
            refreshTokenPromise = null;
          });
      }

      // กรณีที่ 2: รอ Refresh Token ที่กำลังทำงานอยู่ แล้ว set token ใหม่ใน header
      try {
        const newAccessToken = await refreshTokenPromise;
        originalRequest!.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest!);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    showError(error.message || '')
    return Promise.reject(error);
  }
);

const clearAuthAndLogout = (error: unknown) => {
  console.log('clearAuthAndLogout')
  store.dispatch(clearToken());
  store.dispatch(clearUserProfile());
  window.location.href = "/login"
  return Promise.reject(error);
}

export default api;
