"use client"

import * as React from "react"
import {addMonths, format, Locale} from "date-fns"
import {DateRange} from "react-day-picker"

import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Calendar} from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarDays} from "@fortawesome/free-solid-svg-icons";
import {th} from "date-fns/locale"
import {useEffect} from "react";

interface DateRangePickerProps {
  className?: React.HTMLAttributes<HTMLDivElement>,
  setData: (value: DateRange | undefined) => void,
  data: DateRange | undefined,
  label?: string,
  disabled?: boolean
}

const DatePickerWithRange = ({
                               className,
                               setData,
                               data,
                               label,
                               disabled
                             }: DateRangePickerProps) => {

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addMonths(new Date(), 1),
  })

  useEffect(() => {
    setDate(data)
  }, [data]);

  const handleChangeDate = (value: DateRange | undefined) => {
    setDate(value)
    setData(value)
  }

  function formatBuddhistYearCaption(date: Date, options?: { locale?: Locale }) {
    const buddhistYear = date.getFullYear() + 543
    const month = format(date, "LLL", {locale: options?.locale})
    return `${month} ${buddhistYear}`
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <div className={cn("gap-3")}>
            <div className="text-nowrap mb-2">{label || 'วันที่'}</div>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "!w-full lg:w-[300px] flex items-center justify-between font-normal py-[22]",
                !date && "text-muted-foreground"
              )}
            >
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd/LL/y")} -{" "}
                    {format(date.to, "dd/LL/y")}
                  </>
                ) : (
                  format(date.from, "dd/LL/y")
                )
              ) : (
                <span>เลือกวันที่</span>
              )}

              <FontAwesomeIcon icon={faCalendarDays} className="float-right" size="lg"/>
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            locale={th}
            defaultMonth={date?.from ?? new Date()}
            selected={date}
            onSelect={handleChangeDate}
            numberOfMonths={2}
            formatters={{
              formatCaption: formatBuddhistYearCaption
            }}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DatePickerWithRange;
