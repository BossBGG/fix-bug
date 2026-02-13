"use client"
import {Doughnut} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import {Card} from "@/components/ui/card";

ChartJS.register(ArcElement, Tooltip, Legend);

interface TaskProgressChartProps {
  completedTasks: number;
  totalTasks: number;
}

const TaskProgressChart = ({
                             completedTasks,
                             totalTasks
                           }: TaskProgressChartProps) => {
  const data = {
    datasets: [
      {
        data: [completedTasks, totalTasks],
        backgroundColor: ['#8B5CF6', '#C4B5FD'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const options = {
    rotation: -90,
    circumference: 180,
    plugins: {
      tooltip: {
        enabled: false,
      },
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Card className="bg-[#F8F8F8] p-3 border-0 w-full h-full">
      <div className="flex flex-col sm:flex-row flex-wrap items-center">
        <div className="relative w-50 h-25 mr-8 mb-3">
          <Doughnut data={data} options={options}/>
          <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">{totalTasks}</span>
          </div>
        </div>
        <div className="space-y-4 sm:mt-0">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#C4B5FD] rounded mr-3"></div>
            <span className="text-[#160C26] text-[12px]">ใบสั่งงานทั้งหมด</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#8B5CF6] rounded mr-3"></div>
            <span className="text-[#160C26] text-[12px]">ดำเนินการงานเสร็จสิ้น</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaskProgressChart;
