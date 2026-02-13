import api from "@/app/api/Api";
import { createTableListApi, TableListApi } from "@/app/api/TableApiHelper";
import { NewsItem } from "@/types";

const path = "v1/announcements";

export const newsList: TableListApi<NewsItem[]> = createTableListApi(path, api);
