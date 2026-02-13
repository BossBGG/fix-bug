"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, setMonth, setYear, addYears, subYears } from "date-fns"
import { th } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MonthPickerProps {
  className?: string
  date?: Date
  setDate?: (date: Date) => void
  displayBuddhistYear?: boolean
}

export function InputMonthPicker({ className, date, setDate, displayBuddhistYear = false }: MonthPickerProps) {
  // State ภายในสำหรับจัดการ "ปี" ที่กำลังแสดงอยู่ (แยกจาก date ที่เลือกจริง)
  const [viewDate, setViewDate] = React.useState(date || new Date())
  const [open, setOpen] = React.useState(false)

  // ถ้ามีการส่ง date เข้ามาใหม่จาก props ให้ update viewDate ตาม
  React.useEffect(() => {
    if (date) setViewDate(date)
  }, [date])

  const handlePrevYear = () => setViewDate(subYears(viewDate, 1))
  const handleNextYear = () => setViewDate(addYears(viewDate, 1))

  const handleSelectMonth = (monthIndex: number) => {
    // สร้าง Date ใหม่จากเดือนที่เลือก และปีปัจจุบันที่แสดงอยู่
    const newDate = setMonth(setYear(date || new Date(), viewDate.getFullYear()), monthIndex)
    console.log('newDate >>>> ', newDate)
    if (setDate) {
      setDate(newDate)
    }
    setOpen(false)
  }

  // รายชื่อเดือนภาษาไทย
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ]

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              displayBuddhistYear 
                ? format(date, "MMMM ", {locale: th}) + (date.getFullYear() + 543)
                : format(date, "MMMM yyyy", {locale: th})
            ) : <span>เลือกเดือน</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">

          {/* ส่วนหัวแสดงปี และปุ่มเปลี่ยนปี */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevYear}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold text-sm">
              {displayBuddhistYear ? viewDate.getFullYear() + 543 : format(viewDate, "yyyy")}
            </div>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextYear}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Grid แสดงรายชื่อเดือน */}
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => {
              const isSelected = date && date.getMonth() === index && date.getFullYear() === viewDate.getFullYear()

              return (
                <Button
                  key={month}
                  variant={isSelected ? "default" : "ghost"}
                  className={cn(
                    "h-9 w-full text-xs px-2", // ปรับขนาดปุ่มให้พอดี
                    !isSelected && "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleSelectMonth(index)}
                >
                  {month}
                </Button>
              )
            })}
          </div>

        </PopoverContent>
      </Popover>
    </div>
  )
}
