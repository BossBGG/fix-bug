import {ApiResponse} from "@/app/api/Api";
import axios, {AxiosInstance,type CancelTokenSource} from "axios";
import {Pagination} from "@/types";

export interface TableResponse<T = unknown> {
  data: T[],
  meta: Pagination,
  pagination: Pagination,
  items: T[],
  total: number
  draw: number
  limit: number
  page: number
}

export interface ListTableData {
  // draw: number,
  // search: string,
  // search_fields: string,
  // sort: string[], // should be field dir
  page: number,
  // size?: number,
  limit: number,
  sortBy?: string,
  sortOrder?: string
}

export interface TableListApiResult<T = unknown> {
  api: Promise<ApiResponse<TableResponse<T>>>;
  cancelToken: CancelTokenSource
}

export interface TableListApi<T = unknown> {
  callApi: (data: ListTableData) => Promise<TableListApiResult<T>>
}

export function createTableListApi<T = unknown> (path: string, api: AxiosInstance): TableListApi<T> {
  return {
    callApi: (data: ListTableData) => {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      return Promise.resolve({
          api: api.get(path, {params: data, cancelToken: source.token }),
          cancelToken: source
        }
      )
    }
  }
}
