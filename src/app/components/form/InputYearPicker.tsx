"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { setYear } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface YearPickerProps {
  date?: Date
  setDate: (date: Date) => void
  className?: string
}

export function InputYearPicker({ date, setDate, className }: YearPickerProps) {
  const [open, setOpen] = React.useState(false)

  // viewYear เก็บค่าเป็น ค.ศ. เพื่อใช้คำนวณ Logic
  const [viewYear, setViewYear] = React.useState(date?.getFullYear() || new Date().getFullYear())

  React.useEffect(() => {
    if (date) setViewYear(date.getFullYear())
  }, [date])

  // ฟังก์ชันแปลง ค.ศ. -> พ.ศ.
  const toThaiYear = (adYear: number) => adYear + 543

  // คำนวณช่วงปีที่จะแสดง (Logic ค.ศ.)
  const startYear = Math.floor(viewYear / 10) * 10
  const endYear = startYear + 9

  const handlePrevDecade = () => setViewYear((prev) => prev - 10)
  const handleNextDecade = () => setViewYear((prev) => prev + 10)

  const handleSelectYear = (year: number) => {
    const newDate = setYear(date || new Date(), year)
    setDate(newDate)
    setOpen(false)
  }

  // สร้าง array ปี (ค.ศ.)
  const years = Array.from({ length: 12 }, (_, i) => startYear - 1 + i)

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
              // แสดงผลที่ปุ่ม Input เป็น พ.ศ.
              <span>{toThaiYear(date.getFullYear())}</span>
            ) : (
              <span>เลือกปี</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">

          {/* Header แสดงช่วงปี พ.ศ. */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevDecade}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-semibold text-sm">
              {toThaiYear(startYear)} - {toThaiYear(endYear)}
            </div>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextDecade}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Grid แสดงปี พ.ศ. */}
          <div className="grid grid-cols-3 gap-2">
            {years.map((year) => {
              const isSelected = date?.getFullYear() === year
              const isCurrentDecade = year >= startYear && year <= endYear

              return (
                <Button
                  key={year}
                  variant={isSelected ? "default" : "ghost"}
                  className={cn(
                    "h-9 w-full text-sm",
                    !isCurrentDecade && "text-muted-foreground opacity-50"
                  )}
                  onClick={() => handleSelectYear(year)}
                >
                  {/* แสดงผลในปุ่มเป็น พ.ศ. */}
                  {toThaiYear(year)}
                </Button>
              )
            })}
          </div>

        </PopoverContent>
      </Popover>
    </div>
  )
}
