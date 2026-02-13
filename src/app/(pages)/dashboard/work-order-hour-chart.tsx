import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { addMonths, format } from "date-fns";
import { th } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import InputSelect from "@/app/components/form/InputSelect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import {
  MonthlyData,
  DailyData,
  WeekDayData,
  WeekInMonth,
  QuarterlyData,
  WorkHours,
} from "@/types";
import { cn } from "@/lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const computedStyle = getComputedStyle(document.body);
const fontFamily = computedStyle.fontFamily;
ChartJS.defaults.font.family = fontFamily;

export const options = {
  plugins: {
    title: {
      display: false,
    },
    legend: {
      position: "bottom" as const,
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    tooltip: {
      usePointStyle: true,
      boxWidth: 8,
      boxHeight: 8,
      callbacks: {
        label: function (context: {
          dataset: { label?: string };
          dataIndex: number;
          parsed: { y: number | null };
        }) {
          const dataset = context.dataset;
          const value = context.parsed.y ?? 0;
          return `${dataset.label} : ${value.toLocaleString()} ชม.`;
        },
        labelPointStyle: function () {
          return {
            pointStyle: "circle" as const,
            rotation: 0,
          };
        },
      },
    },
  },
  /*animation: {
    onComplete: function (animation: any) {
      const chart = animation.chart;
      const ctx = chart.ctx;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px Arial';

      chart.data.datasets.forEach((dataset: any, i: number) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((bar: any, index: number) => {
          const data = dataset.data[index];
          if (data > 0) {
            ctx.fillText(data.toLocaleString(), bar.x, bar.y - 5);
          }
        });
      });
    }
  },*/
  responsive: true,
  maintainAspectRatio: false,
};

export const transformDataForChart = (
  data:
    | DailyData
    | WeekDayData[]
    | WeekInMonth[]
    | QuarterlyData[]
    | MonthlyData[],
  chartMode: "day" | "week" | "month" | "quarter" | "year",
  chartFilter?: Date
) => {
  const renderLabels = () => {
    switch (chartMode) {
      case "day":
        if (chartFilter) {
          return [format(chartFilter, "d MMMM yyyy", { locale: th })];
        }
        return [""];

      case "week":
        if (Array.isArray(data)) {
          return (data as WeekDayData[]).map((item) => item.date);
        }
        return [];

      case "month":
        if (Array.isArray(data)) {
          return (data as WeekInMonth[]).map((item) => item.weekLabel);
        }
        return [];

      case "quarter":
        if (Array.isArray(data)) {
          return (data as QuarterlyData[]).map((item) => item.quarterName);
        }
        return [];

      case "year":
        if (Array.isArray(data)) {
          return (data as MonthlyData[]).map((item) => item.monthName);
        }
        return [];

      default:
        return [];
    }
  };

  const renderDataValues = (
    field:
      | "peaEmployeeHours"
      | "vendorHours"
      | "peaEmployeeCount"
      | "vendorCount"
  ) => {
    switch (chartMode) {
      case "day":
        if (!Array.isArray(data)) {
          return [(data as DailyData)[field]];
        }
        return [0];

      case "week":
        if (Array.isArray(data)) {
          return (data as WeekDayData[]).map((item) => item[field]);
        }
        return [];

      case "month":
        if (Array.isArray(data)) {
          return (data as WeekInMonth[]).map((item) => item[field]);
        }
        return [];

      case "quarter":
        if (Array.isArray(data)) {
          return (data as QuarterlyData[]).map((item) => item[field]);
        }
        return [];

      case "year":
        if (Array.isArray(data)) {
          return (data as MonthlyData[]).map((item) => item[field]);
        }
        return [];

      default:
        return [];
    }
  };

  return {
    labels: renderLabels(),
    datasets: [
      {
        label: "พนักงาน PEA",
        data: renderDataValues("peaEmployeeHours"),
        backgroundColor: "#8561FF",
        borderRadius: 12,
        maxBarThickness: 40,
      },
      {
        label: "ผู้รับจ้าง",
        data: renderDataValues("vendorHours"),
        backgroundColor: "#E79E9E",
        borderRadius: 12,
        maxBarThickness: 40,
      },
    ],
  };
};

const CardCountHourWorkOrder = ({
  label,
  count,
  bgColor = "#E4DCFF",
  iconColor,
  viewMode = "ALL",
  chartMode,
}: {
  label: string;
  count: number;
  bgColor?: string;
  iconColor?: string;
  viewMode: "ALL" | "SELF";
  chartMode: "day" | "week" | "month" | "quarter" | "year";
}) => {
  const renderUnit = () => {
    let unit = "วัน";
    switch (chartMode) {
      case "week":
        unit = "สัปดาห์";
        break;
      case "month":
        unit = "เดือน";
        break;
      case "quarter":
      case "year":
        unit = "ปี";
        break;
      default:
        unit = "วัน";
        break;
    }

    return `ชม./${unit}`;
  };

  return (
    <Card
      className={cn(
        "px-2 w-full mb-3 md:mb-0 shadow-none border-none",
        viewMode === "ALL" ? "md:w-1/3" : "w-full"
      )}
    >
      <Card
        className="p-3 bg-white shadow-none border-1"
        style={{ backgroundColor: bgColor, borderColor: bgColor }}
      >
        <div className="flex justify-between">
          <div className="flex items-center">
            {iconColor && (
              <FontAwesomeIcon
                icon={faUser}
                color={iconColor}
                size={"2xl"}
                className="me-3"
              />
            )}
            <div>
              <div className="font-medium text-[14px] mb-3">{label}</div>
              <div className="text-[12px] font-medium">(ทั้งหมด)</div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="text-[24px] font-bold me-2">
              {count ? count.toLocaleString() : 0}
            </div>
            <div className="font-medium text-[14px]">{renderUnit()}</div>
          </div>
        </div>
      </Card>
    </Card>
  );
};

interface WorkOrderHourChartProps {
  data: WorkHours;
  dataChart:
    | DailyData
    | WeekDayData[]
    | WeekInMonth[]
    | QuarterlyData[]
    | MonthlyData[];
  viewMode: "ALL" | "SELF";
  chartMode: "day" | "week" | "month" | "quarter" | "year";
  chartFilter?: Date;
}

export function WorkOrderHourChart({
  data,
  dataChart,
  viewMode,
  chartMode,
  chartFilter,
}: WorkOrderHourChartProps) {
  const chartData = transformDataForChart(dataChart, chartMode, chartFilter);

  return (
    <Card className="p-3 mt-3">
      <div className="text-semibold">จำนวนชั่วโมงการปฏิบัติงานรวม</div>

      <div className="flex flex-wrap">
        {viewMode === "ALL" && (
          <>
            <CardCountHourWorkOrder
              label={"พนักงาน PEA"}
              count={data?.peaEmployeeHours || 0}
              iconColor={"#671FAB"}
              viewMode={viewMode}
              chartMode={chartMode}
            />
            <CardCountHourWorkOrder
              label={"ผู้รับจ้าง"}
              count={data?.vendorHours || 0}
              bgColor={"#FFE2E5"}
              iconColor={"#FF616D"}
              viewMode={viewMode}
              chartMode={chartMode}
            />
          </>
        )}
        <CardCountHourWorkOrder
          label={"ชั่วโมง"}
          count={data?.totalHours || 0}
          bgColor={"#E8E9F1"}
          viewMode={viewMode}
          chartMode={chartMode}
        />
      </div>

      <div className="w-full h-[400px]">
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
