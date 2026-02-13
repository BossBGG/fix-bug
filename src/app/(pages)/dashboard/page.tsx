"use client"
import React, { useEffect, useState } from "react";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import DashboardBreadcrumb from "@/app/(pages)/dashboard/breadcrumb";
import LatestUpdateData from "@/app/components/utils/LatestUpdateData";
import { WorkOrderStackChart } from "@/app/(pages)/dashboard/work-order-stack-chart";
import { WorkOrderHourChart } from "@/app/(pages)/dashboard/work-order-hour-chart";
import NotificationList from "@/app/(pages)/dashboard/notification-list";
import { Card } from "@/components/ui/card";
import MyCalendar from "@/app/components/calendar/MyCalendar";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNoteSticky, faFileCirclePlus, faClock, faCircleCheck, faCircleXmark, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import TaskProgressChart from "@/app/(pages)/dashboard/task-progress-chart";
import { getDashboardData } from "@/app/api/DashboardApi";
import { DashboardObj, WeekRange } from "@/types";
import { dismissAlert, showProgress } from "@/app/helpers/Alert";
import InputSelect from "@/app/components/form/InputSelect";
import InputDateButton from "@/app/components/form/InputDateButton";
import { InputWeekPicker } from "@/app/components/form/InputWeekPicker";
import { InputMonthPicker } from "@/app/components/form/InputMonthPicker";
import { InputQuarterPicker } from "@/app/components/form/InputQuarterPicker";
import { InputYearPicker } from "@/app/components/form/InputYearPicker";
import {useAppSelector} from "@/app/redux/hook";
import {cn} from "@/lib/utils";

interface ViewButtonProps {
  label: string,
  selected: boolean,
  updateData: () => void
}

interface StatCardProps {
  backgroundColor: string,
  value: number,
  label: string,
  iconColor: string,
  unit: string,
  icon: IconDefinition
}

const StatCard = ({ backgroundColor, value, label, unit, icon, iconColor }: StatCardProps) => {
  return (
    <div className="w-full lg:w-1/4 px-2 mb-3 xl:mb-0 flex">
      <Card className="flex flex-row items-center justify-between p-3 w-full h-full"
        style={{ backgroundColor, borderColor: backgroundColor }}>
        <div>
          <div className="font-medium mb-2">{label}</div>

          <div className="flex items-center">
            <div className="text-[32px] font-bold me-2">{value}</div>
            <div className="text-[12px]">{unit}</div>
          </div>
        </div>

        <div>
          <FontAwesomeIcon icon={icon} color={iconColor} size="2x" />
        </div>
      </Card>
    </div>
  )
}

const ViewButton = ({
  label,
  selected,
  updateData
}: ViewButtonProps) => {
  const defaultClass = "w-1/2 rounded-full shadow-none cursor-pointer bg-[#F8F8F8] text-[#57595B] hover:bg-transparent";
  const activeClass = "bg-[#E1D2FF] text-[#671FAB]";

  return (
    <Button className={`${defaultClass} ${selected && activeClass}`}
      onClick={() => updateData()}>
      {label}
    </Button>
  )
}

const Dashboard = () => {
  const { setBreadcrumb } = useBreadcrumb();
  const user = useAppSelector((state) => state.user)
  const [viewMode, setViewMode] = useState<"ALL" | "SELF">(user.type === 'VENDOR_USER'? "SELF" : "ALL")
  const [data, setData] = useState<DashboardObj>({} as DashboardObj);
  const [countWorkOrder, setCountWorkOrder] = useState<number>(0)
  const [chartMode, setChartMode] = useState<"day" | "week" | "month" | "quarter" | "year">("day")
  const [chartFilter, setChartFilter] = useState<any>(new Date())

  useEffect(() => {
    setBreadcrumb(<DashboardBreadcrumb />)
  }, [setBreadcrumb]);

  const fetchDashboardData = async () => {
    showProgress()
    let params: any = { view: viewMode }

    switch (chartMode) {
      case 'day':
        if (chartFilter instanceof Date) {
          const year = chartFilter.getFullYear()
          const month = String(chartFilter.getMonth() + 1).padStart(2, '0')
          const day = String(chartFilter.getDate()).padStart(2, '0')
          params = {
            type: 'daily',
            date: `${year}-${month}-${day}`,
            view: viewMode
          }
        }
        break

      case 'week':
        if (chartFilter && chartFilter.from && chartFilter.to) {
          const formatDate = (date: Date) => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
          }
          params = {
            type: 'weekly',
            from: formatDate(chartFilter.from),
            to: formatDate(chartFilter.to),
            view: viewMode
          }
        }
        break

      case 'month':
        if (chartFilter instanceof Date) {
          const year = chartFilter.getFullYear()
          const month = String(chartFilter.getMonth() + 1).padStart(2, '0')
          params = {
            type: 'monthly',
            month: `${year}-${month}`,
            view: viewMode
          }
        }
        break

      case 'quarter':
        if (chartFilter instanceof Date) {
          const year = chartFilter.getFullYear()
          const month = chartFilter.getMonth() + 1
          const quarter = Math.ceil(month / 3)
          params = {
            type: 'quarterly',
            // quarter: `${year}-Q${quarter}`,
            quarter: year,
            view: viewMode
          }
        }
        break

      case 'year':
        if (chartFilter instanceof Date) {
          const year = chartFilter.getFullYear()
          params = {
            type: 'yearly',
            year: String(year),
            view: viewMode
          }
        }
        break

      default:
        params = {
          type: 'yearly',
          year: String(new Date().getFullYear()),
          view: viewMode
        }
    }

    const response = await getDashboardData(params).finally(() => dismissAlert())
    if (response.status === 200 && response.data.data) {
      setData(response.data.data)
      setCountWorkOrder(response.data.data.summary?.total || 0)
    } else {
      setData({} as DashboardObj)
    }
  }

  useEffect(() => {
    if (chartFilter) {
      fetchDashboardData()
    }
  }, [
    chartMode,
    viewMode,
    chartFilter instanceof Date ? chartFilter.getTime() : JSON.stringify(chartFilter)
  ]);

  const handleChangeChartMode = (mode: "day" | "week" | "month" | "quarter" | "year") => {
    setChartMode(mode)
    setChartFilter(new Date())
  }

  const handleViewMode = (mode: "ALL" | "SELF") => {
    setCountWorkOrder(0)
    setViewMode(mode)
  }

  return (
    <div>
      <LatestUpdateData
        addonRightContent={
          <div className="flex items-center flex-wrap justify-end">
            <div className="mr-2 flex items-center p-2 border-1 rounded-md">
              <InputSelect options={[
                { value: "day", label: "วันที่" },
                { value: "week", label: "สัปดาห์" },
                { value: "month", label: "เดือน" },
                { value: "quarter", label: "ไตรมาส" },
                { value: "year", label: "ปี พ.ศ." },
              ]}
                value={chartMode}
                placeholder={""}
                setData={(mode: string | number) => handleChangeChartMode(mode as "day" | "week" | "month" | "quarter" | "year")}
                className="rounded-full text-[#671FAB] cursor-pointer !h-[40px] !w-[7rem] mr-2"
              />

              {
                chartMode === 'day' &&
                <InputDateButton
                  value={chartFilter as Date}
                  onChange={(d: Date | undefined) => setChartFilter(d)}
                  displayBuddhistYear={true}
                />
              }

              {
                chartMode === 'week' &&
                <InputWeekPicker
                  setValue={(w: WeekRange) => setChartFilter(w)}
                  value={chartFilter instanceof Date ? chartFilter : new Date()}
                  displayBuddhistYear={true}
                />
              }

              {
                chartMode === 'month' &&
                <InputMonthPicker
                  setDate={(d: Date) => setChartFilter(d)}
                  date={chartFilter as Date}
                  displayBuddhistYear={true}
                />
              }

              {/*{
                chartMode === 'quarter' &&
                <InputQuarterPicker
                  setDate={(d: Date) => setChartFilter(d)}
                  date={chartFilter ? new Date(chartFilter) : new Date()}
                />
              }*/}

              {
                (chartMode === 'quarter' || chartMode === 'year') &&
                <InputYearPicker
                  setDate={(d: Date) => setChartFilter(d)}
                  date={chartFilter ? new Date(chartFilter) : new Date()}
                />
              }
            </div>

            <div className={
              cn(
                "bg-[#F8F8F8] text-[#4A4A4A] rounded-full p-1 font-semibold mr-2 my-3 sm:my-0",
                user.type === 'VENDOR_USER' ? 'hidden' : ''
              )
            }>
              <ViewButton
                label={"มุมมองทั้งหมด"}
                // label={`มุมมองทั้งหมด ${countWorkOrder && viewMode === 'ALL' ? `(${countWorkOrder})` : ""}`}
                selected={viewMode === 'ALL'}
                updateData={() => handleViewMode('ALL')}
              />
              <ViewButton
                label={"มุมมองตนเอง"}
                // label={`มุมมองตนเอง  ${countWorkOrder && viewMode === 'SELF' ? `(${countWorkOrder})` : ""}`}
                selected={viewMode === 'SELF'}
                updateData={() => handleViewMode('SELF')}
              />
            </div>
          </div>
        }
      />

      <div className="flex my-4 flex-wrap xl:flex-nowrap items-stretch">
        <StatCard backgroundColor="#E4DCFF" iconColor="#8561FF" value={data.summary?.total || 0} label="ใบสั่งงานทั้งหมด" unit="/ ใบ" icon={faNoteSticky} />
        <StatCard backgroundColor="#E3F2FF" iconColor="#2097F4" value={data.summary?.pending || 0} label="ใบสั่งงานใหม่" unit="/ ใบ" icon={faFileCirclePlus} />
        <StatCard backgroundColor="#FFF4E4" iconColor="#E86339" value={data.summary?.inProgress || 0} label="ระหว่างการดำเนินงาน" unit="/ งาน" icon={faArrowsRotate} />
        <StatCard backgroundColor="#E7F4E8" iconColor="#298267" value={data.summary?.completed || 0} label="ดำเนินงานเสร็จสิ้น" unit="/ งาน" icon={faCircleCheck} />
        <StatCard backgroundColor="#FFD4D4" iconColor="#E02424" value={data.summary?.cancelled || 0} label="ใบสั่งงานที่ยกเลิก" unit="/ ใบ" icon={faCircleXmark} />
        {/*<div className="w-full h-full lg:w-1/2 xl:w-2/7 px-2 mb-3 xl:mb-0">
          <TaskProgressChart completedTasks={data.summary?.completionRate || 30}
                             totalTasks={data.summary?.total || 0}
          />
        </div>*/}
      </div>

      {/*รายการทั้งหมด*/}
      <WorkOrderStackChart
        data={
          chartMode === 'day' ? (data.dailyData || { date: '', created: 0, completed: 0, peaEmployeeCount: 0, peaEmployeeHours: 0, vendorCount: 0, vendorHours: 0, avgHoursPerPerson: 0, avgHoursPerDay: 0 }) :
          chartMode === 'week' ? (data.weeklyData || []) :
          chartMode === 'month' ? (data.weeksInMonth || []) :
          chartMode === 'quarter' ? (data.quarterlyData || []) :
          (data.monthlyData || [])
        }
        chartMode={chartMode}
        chartFilter={chartFilter instanceof Date ? chartFilter : undefined}
      />

      {/*จำนวนชั่วโมงการปฏิบัติงานรวม*/}
      <WorkOrderHourChart
        data={data.workHours}
        dataChart={
          chartMode === 'day' ? (data.dailyData || { date: '', created: 0, completed: 0, peaEmployeeCount: 0, peaEmployeeHours: 0, vendorCount: 0, vendorHours: 0, avgHoursPerPerson: 0, avgHoursPerDay: 0 }) :
          chartMode === 'week' ? (data.weeklyData || []) :
          chartMode === 'month' ? (data.weeksInMonth || []) :
          chartMode === 'quarter' ? (data.quarterlyData || []) :
          (data.monthlyData || [])
        }
        chartMode={chartMode}
        viewMode={viewMode}
        chartFilter={chartFilter instanceof Date ? chartFilter : undefined}
      />

      {/*<div className="w-full flex flex-wrap">
        <div className="w-full md:w-3/4 mt-3 px-2">
          <Card>
            <MyCalendar title="ปฏิทินงาน" viewMode={viewMode}/>
          </Card>
        </div>
        <div className="w-full md:w-1/4 px-2">
          <NotificationList/>
        </div>
      </div>*/}
    </div>
  )
}

export default Dashboard
