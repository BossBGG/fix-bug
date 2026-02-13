import api, {ApiResponse} from "@/app/api/Api";
import {DashboardObj} from "@/types";

type DailyParams = {
  type: "daily";
  date: string;
  view?: "SELF" | "ALL";
};

type WeeklyParams = {
  type: "weekly";
  from: string;
  to: string;
  view?: "SELF" | "ALL";
};

type MonthlyParams = {
  type: "monthly";
  month: string;
  view?: "SELF" | "ALL";
};

type QuarterlyParams = {
  type: "quarterly";
  quarter: string;
  view?: "SELF" | "ALL";
};

type YearlyParams = {
  type: "yearly";
  year: string;
  view?: "SELF" | "ALL";
};

export type DashboardParams =
  | DailyParams
  | WeeklyParams
  | MonthlyParams
  | QuarterlyParams
  | YearlyParams;

export const getDashboardData = (
  params: DashboardParams
): Promise<ApiResponse<DashboardObj>> => {
  const view = (params.view ?? "ALL").toLowerCase();
  const searchParams = new URLSearchParams({ view });

  switch (params.type) {
    case "daily":
      searchParams.set("date", params.date);
      break;
    case "weekly":
      searchParams.set("from", params.from);
      searchParams.set("to", params.to);
      break;
    case "monthly":
      searchParams.set("month", params.month);
      break;
    case "quarterly":
      searchParams.set("quarter", params.quarter);
      break;
    case "yearly":
      searchParams.set("year", params.year);
      break;
  }

  return api.get(`/v1/dashboard?${searchParams.toString()}`);
};
