"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, setMonth, setYear, startOfQuarter, addYears, subYears } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface QuarterPickerProps {
  date?: Date
  setDate: (date: Date) => void
  className?: string
}

export function InputQuarterPicker({ date, setDate, className }: QuarterPickerProps) {
  const [open, setOpen] = React.useState(false)
  // State สำหรับ "ปี" ที่กำลังแสดงอยู่ใน Popover (แยกจากปีที่เลือกจริง)
  const [viewYear, setViewYear] = React.useState(date?.getFullYear() || new Date().getFullYear())

  // Update viewYear ถ้า date props เปลี่ยน
  React.useEffect(() => {
    if (date) setViewYear(date.getFullYear())
  }, [date])

  const handlePrevYear = () => setViewYear((prev) => prev - 1)
  const handleNextYear = () => setViewYear((prev) => prev + 1)

  const handleSelectQuarter = (quarterIndex: number) => {
    // quarterIndex: 0 = Q1, 1 = Q2, 2 = Q3, 3 = Q4
    // คำนวณเดือนเริ่มต้นของไตรมาสนั้น (0, 3, 6, 9)
    const startMonth = quarterIndex * 3

    // สร้าง Date ใหม่: วันแรก ของเดือนที่คำนวณ ในปีที่เลือก
    const newDate = startOfQuarter(setMonth(setYear(new Date(), viewYear), startMonth))

    setDate(newDate)
    setOpen(false)
  }

  // Helper เพื่อเช็คว่าไตรมาสนี้ถูกเลือกอยู่หรือไม่
  const isSelected = (quarterIndex: number) => {
    if (!date) return false
    const currentQuarterIndex = Math.floor(date.getMonth() / 3)
    return date.getFullYear() === viewYear && currentQuarterIndex === quarterIndex
  }

  const quarters = [
    { name: "Q1", label: "มกราคม - มีนาคม" },
    { name: "Q2", label: "เมษายน - มิถุนายน" },
    { name: "Q3", label: "กรกฎาคม - กันยายน" },
    { name: "Q4", label: "ตุลาคม - ธันวาคม" },
  ]

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              // แสดงผลเช่น "Q1 2024"
              `${format(date, "QQQ yyyy")}`
            ) : (
              <span>เลือกไตรมาส</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">

          {/* Header ส่วนเลือกปี */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevYear}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold text-sm">
              {viewYear}
            </div>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextYear}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Grid เลือกไตรมาส */}
          <div className="grid grid-cols-2 gap-2">
            {quarters.map((q, index) => (
              <Button
                key={q.name}
                variant={isSelected(index) ? "default" : "outline"}
                className={cn(
                  "h-16 flex flex-col items-center justify-center gap-1",
                  !isSelected(index) && "hover:bg-accent hover:text-accent-foreground border-dashed"
                )}
                onClick={() => handleSelectQuarter(index)}
              >
                <span className="text-lg font-bold">{q.name}</span>
                <span className="text-[10px] text-muted-foreground font-normal uppercase">
                  {isSelected(index) ? (
                    // เปลี่ยนสี text เล็กน้อยถ้าถูกเลือก
                    <span className="text-primary-foreground/80">{q.label}</span>
                  ) : (
                    q.label
                  )}
                </span>
              </Button>
            ))}
          </div>

        </PopoverContent>
      </Popover>
    </div>
  )
}
