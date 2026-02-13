import React from "react";
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
import { WorkOrderWeeklyData } from "@/types";
import { useAppSelector } from "@/app/redux/hook";
import { MOBILE_SCREEN } from "@/app/redux/slices/ScreenSizeSlice";

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
      mode: "index" as const,
      intersect: false,
      callbacks: {
        title: function (context: any) {
          return context[0].label;
        },
        label: function (context: any) {
          return `${context.dataset.label}: ${context.parsed.y}`;
        },
        afterLabel: function (context: any) {
          if (context.datasetIndex === 1) {
            // แสดงผลรวมเฉพาะที่แท่งสุดท้าย
            const total = context.chart.data.datasets.reduce(
              (sum: number, dataset: any) => {
                return sum + dataset.data[context.dataIndex];
              },
              0
            );
            return `รวม: ${total}`;
          }
          return "";
        },
      },
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
};

const transformDataForChart = (data: WorkOrderWeeklyData[]) => {
  return {
    labels: data.map((item) => item.dayOfWeekThai),
    datasets: [
      {
        label: "งานที่ปฏิบัติงาน",
        data: data.map((item) => item.executionWorkOrders),
        backgroundColor: "#9538EA",
        borderSkipped: false,
        borderRadius: {
          topLeft: 8,
          topRight: 8,
          bottomLeft: 8,
          bottomRight: 8,
        },
        maxBarThickness: 30,
        categoryPercentage: 0.6,
      },
      {
        label: "งานสำรวจ",
        data: data.map((item) => item.fieldSurveys),
        backgroundColor: "#D9A6FA",
        borderSkipped: false,
        borderRadius: {
          topLeft: 8,
          topRight: 8,
          bottomLeft: 8,
          bottomRight: 8,
        },
        maxBarThickness: 30,
        categoryPercentage: 0.6,
      },
    ],
  };
};

export function WorkOrderChart({ data }: { data: WorkOrderWeeklyData[] }) {
  const chartData = transformDataForChart(data);
  const screenSize = useAppSelector((state) => state.screen_size);

  return (
    <Bar
      options={options}
      data={chartData}
      height={screenSize === MOBILE_SCREEN ? 350 : "100%"}
    />
  );
}
