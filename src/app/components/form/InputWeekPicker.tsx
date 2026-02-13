"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { th } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { WeekRange } from "@/types"

interface InputWeekPickerProps {
  className?: string
  setValue: (weekRange: WeekRange) => void
  value?: Date
  displayBuddhistYear?: boolean
}

export function InputWeekPicker({
                             className,
                             setValue,
                             value,
                             displayBuddhistYear = false
                           }: InputWeekPickerProps) {
  // ฟังก์ชันคำนวณวันเริ่มต้นและสิ้นสุดของสัปดาห์
  // weekStartsOn: 1 คือเริ่มวันจันทร์ (ถ้า 0 คือวันอาทิตย์)
  const getWeekRange = (date: Date) => {
    return {
      from: startOfWeek(date, { weekStartsOn: 1 }),
      to: endOfWeek(date, { weekStartsOn: 1 }),
    }
  }

  const initialDate = value || new Date()
  const [date, setDate] = React.useState<Date | undefined>(initialDate)
  const [open, setOpen] = React.useState(false)
  const [hoveredDay, setHoveredDay] = React.useState<Date | undefined>(undefined)

  // State สำหรับเก็บ Range ที่จะแสดงผลในปฏิทิน
  const [selectedRange, setSelectedRange] = React.useState<{
    from: Date
    to: Date
  }>(getWeekRange(initialDate))

  // Send initial week range to parent on mount
  React.useEffect(() => {
    const weekRange = getWeekRange(initialDate)
    setValue(weekRange)
  }, [])

  const hoveredRange = React.useMemo(() => {
    if (!hoveredDay) return undefined
    return getWeekRange(hoveredDay)
  }, [hoveredDay])

  // จัดการเมื่อมีการเลือกวันที่
  const handleSelect = (val: Date | undefined) => {
    if (val) {
      setDate(val)
      const weekRange = getWeekRange(val)
      setSelectedRange(weekRange)
      setValue(weekRange)
      setOpen(false) // ปิด Popover เมื่อเลือกเสร็จ
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              displayBuddhistYear
                ? format(selectedRange.from, "dd/LL/") + (selectedRange.from.getFullYear() + 543) + " - " + format(selectedRange.to, "dd/LL/") + (selectedRange.to.getFullYear() + 543)
                : format(selectedRange.from, "dd/LL/y") + " - " + format(selectedRange.to, "dd/LL/y")
            ) : (
              <span>Pick a week</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date}
            selected={selectedRange}
            onDayClick={handleSelect} // ใช้ onDayClick เพื่อดักจับการคลิกวันเดียวแล้วแปลงเป็น Range
            onDayMouseEnter={setHoveredDay}
            onDayMouseLeave={() => setHoveredDay(undefined)}
            numberOfMonths={1}
            locale={th}
            // ปรับแต่ง style เพิ่มเติมเพื่อให้ดูเหมือนเลือกทั้งสัปดาห์
            modifiers={{
              selected: selectedRange, // ไฮไลท์ช่วงที่เลือก
              hoverRange: hoveredRange,
              hoverRangeStart: hoveredRange?.from,
              hoverRangeEnd: hoveredRange?.to,
            }}
            modifiersClassNames={{
              hoverRange: "bg-accent text-accent-foreground",
              hoverRangeStart: "bg-accent text-accent-foreground rounded-l-md",
              hoverRangeEnd: "bg-accent text-accent-foreground rounded-r-md",
            }}
            // ปิดการเลือก Range แบบลากเอง ให้ใช้ Logic เราแทน
            classNames={{
              day_range_middle: "aria-selected:bg-primary aria-selected:text-primary-foreground",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
