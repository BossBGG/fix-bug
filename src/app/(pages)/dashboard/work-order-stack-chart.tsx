import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {Bar} from 'react-chartjs-2';
import {addMonths, format} from "date-fns";
import {th} from "date-fns/locale";
import {Card} from "@/components/ui/card";
import {MonthlyData, DailyData, WeekDayData, WeekInMonth, QuarterlyData} from "@/types";

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
      display: false
    },
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        pointStyle: "circle"
      }
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      usePointStyle: true,
      boxWidth: 8,
      boxHeight: 8,
      callbacks: {
        title: function(context: any) {
          return context[0].label;
        },
        label: function(context: any) {
          return `${context.dataset.label}: ${context.parsed.y}`;
        },
        afterLabel: function(context: any) {
          if (context.datasetIndex === 3) { // แสดงผลรวมเฉพาะที่แท่งสุดท้าย
            const total = context.chart.data.datasets.reduce((sum: number, dataset: any) => {
              return sum + dataset.data[context.dataIndex];
            }, 0);
            return `รวม: ${total}`;
          }
          return '';
        },
        labelPointStyle: function() {
          return {
            pointStyle: 'circle' as const,
            rotation: 0
          };
        }
      }
    }
  },
  layout: {
    padding: {
      bottom: 50
    }
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
    mode: 'index' as const,
    intersect: false,
  }
};

const transformDataForChart = (
  data: DailyData | WeekDayData[] | WeekInMonth[] | QuarterlyData[] | MonthlyData[],
  chartMode: "day" | "week" | "month" | "quarter" | "year",
  chartFilter?: Date
) => {

  const renderLabels = () => {
    switch(chartMode) {
      case 'day':
        if (chartFilter) {
          return [format(chartFilter, 'd MMMM yyyy', { locale: th })];
        }
        return [''];

      case 'week':
        if (Array.isArray(data)) {
          return (data as WeekDayData[]).map(item => item.date);
        }
        return [];

      case 'month':
        if (Array.isArray(data)) {
          return (data as WeekInMonth[]).map(item => item.weekLabel);
        }
        return [];

      case 'quarter':
        if (Array.isArray(data)) {
          return (data as QuarterlyData[]).map(item => item.quarterName);
        }
        return [];

      case 'year':
        if (Array.isArray(data)) {
          return (data as MonthlyData[]).map(item => item.monthName);
        }
        return [];

      default:
        return [];
    }
  }

  const renderDataValues = (field: 'pending' | 'inProgress' | 'completed' | 'cancelled') => {
    switch(chartMode) {
      case 'day':
        if (!Array.isArray(data)) {
          return [(data as any)[field] || 0];
        }
        return [0];

      case 'week':
        if (Array.isArray(data)) {
          return (data as any[]).map(item => item[field] || 0);
        }
        return [];

      case 'month':
        if (Array.isArray(data)) {
          return (data as any[]).map(item => item[field] || 0);
        }
        return [];

      case 'quarter':
        if (Array.isArray(data)) {
          return (data as any[]).map(item => item[field] || 0);
        }
        return [];

      case 'year':
        if (Array.isArray(data)) {
          return (data as any[]).map(item => item[field] || 0);
        }
        return [];

      default:
        return [];
    }
  }

  const defaultDatasetConfig = {
    borderSkipped: false,
    borderRadius: {
      topLeft: 8,
      topRight: 8,
      bottomLeft: 8,
      bottomRight: 8
    },
    maxBarThickness: 55,
    categoryPercentage: 0.8
  };

  return {
    labels: renderLabels(),
    datasets: [
      {
        ...defaultDatasetConfig,
        label: 'ใบสั่งงานใหม่',
        data: renderDataValues('pending'),
        backgroundColor: "#90CAF9",
        hoverBackgroundColor: "#90CAF9"
      },
      {
        ...defaultDatasetConfig,
        label: 'ระหว่างการดำเนินงาน',
        data: renderDataValues('inProgress'),
        backgroundColor: "#FFCC80",
        hoverBackgroundColor: "#FFCC80"
      },
      {
        ...defaultDatasetConfig,
        label: 'ดำเนินงานเสร็จสิ้น',
        data: renderDataValues('completed'),
        backgroundColor: "#A5D6A7",
        hoverBackgroundColor: "#A5D6A7"
      },
      {
        ...defaultDatasetConfig,
        label: 'ใบสั่งงานที่ยกเลิก',
        data: renderDataValues('cancelled'),
        backgroundColor: "#EF9A9A",
        hoverBackgroundColor: "#EF9A9A"
      }
    ]
  };
};

interface WorkOrderStackChartProps {
  data: DailyData | WeekDayData[] | WeekInMonth[] | QuarterlyData[] | MonthlyData[],
  chartMode: "day" | "week" | "month" | "quarter" | "year",
  chartFilter?: Date
}

export function WorkOrderStackChart({
                                      data,
                                      chartMode,
                                      chartFilter
                                    }: WorkOrderStackChartProps) {
  const chartData = transformDataForChart(data, chartMode, chartFilter);

  return <Card className="p-3 w-full h-[400px]">
    <div className="text-semibold">รายการทั้งหมด</div>
    <Bar options={options} data={chartData}/>
  </Card>
}
