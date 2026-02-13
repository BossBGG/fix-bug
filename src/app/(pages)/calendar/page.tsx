'use client'
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import { useEffect, useState } from "react";
import CalendarBreadcrumb from "./breadcrumb";
import LatestUpdateData from "@/app/components/utils/LatestUpdateData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MyCalendar from "@/app/components/calendar/MyCalendar";
import {useAppSelector} from "@/app/redux/hook";

interface ViewButtonProps {
  label: string,
  selected: boolean,
  updateData: () => void
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

const Calendar = () => {
  const { setBreadcrumb } = useBreadcrumb();
  const user = useAppSelector((state) => state.user)
  const [viewMode, setViewMode] = useState<"ALL" | "SELF">(user.type === 'VENDOR_USER' ? "SELF" : "ALL")

  useEffect(() => {
    setBreadcrumb(<CalendarBreadcrumb />)
  }, [setBreadcrumb]);

  const handleViewMode = (mode: "ALL" | "SELF") => {
    setViewMode(mode)
  }

  return (
    <div>
      <LatestUpdateData
        addonRightContent={
          user.type === 'VENDOR_USER' ? <div></div>
            :
            (
              <div className="bg-[#F8F8F8] text-[#4A4A4A] rounded-full p-1 font-semibold mr-2 my-3 sm:my-0">
                <ViewButton
                  label={`มุมมองทั้งหมด`}
                  selected={viewMode === 'ALL'}
                  updateData={() => handleViewMode('ALL')}
                />
                <ViewButton
                  label={`มุมมองตนเอง`}
                  selected={viewMode === 'SELF'}
                  updateData={() => handleViewMode('SELF')}
                />
              </div>
            )
        }
      />

      <div className="w-full mt-3 px-2">
        <Card>
          <MyCalendar title="ปฏิทินงาน" viewMode={viewMode} />
        </Card>
      </div>
    </div>
  )
}

export default Calendar
