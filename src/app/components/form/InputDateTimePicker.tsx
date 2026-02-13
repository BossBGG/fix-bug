import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faXmark } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import {InputTimePicker} from "@/app/components/form/InputTimePicker";

interface InputDateTimePickerProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  formatDate?: string;
  displayBuddhistYear?: boolean;
  showConfirmButton?: boolean;
  showClearButton?: boolean;
  isRequired?: boolean;
}

const InputDateTimePicker: React.FC<InputDateTimePickerProps> = ({
                                                                   label,
                                                                   value,
                                                                   onChange,
                                                                   placeholder = "เลือกวันที่",
                                                                   disabled = false,
                                                                   className,
                                                                   formatDate,
                                                                   displayBuddhistYear,
                                                                   showConfirmButton,
                                                                   showClearButton = false,
                                                                   isRequired = false
                                                                 }) => {
  const [open, setOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>(value);

  useEffect(() => {
    setSelectedDateTime(value);
  }, [value]);

  const handleDateTimeChange = (newDate: Date | undefined) => {
    setSelectedDateTime(newDate);
    if(!showConfirmButton) {
      onChange?.(newDate);
    }
  };

  const handleConfirm = () => {
    onChange?.(selectedDateTime);
  };

  const handleClear = () => {
    setSelectedDateTime(undefined);
    onChange?.(undefined);
    setOpen(false);
  };


  const renderValue = () => {
    if (value) {
      const defaultFormat = "dd/MM/yyyy HH:mm";
      let formattedDate: string;

      if (displayBuddhistYear) {
        const year = value.getFullYear() + 543;
        // **MODIFIED: Format date and time parts separately for Buddhist year**
        const datePart = format(value, formatDate ? formatDate.split(' ')[0] : "dd/MM/", { locale: th });
        const timePart = format(value, formatDate?.split(' ')[1] || "HH:mm");
        formattedDate = `${datePart}${year} ${timePart}`;
      } else {
        formattedDate = format(value, formatDate || defaultFormat, { locale: th });
      }
      return formattedDate;
    }
    return null;
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {label && (
        <label className="font-medium mb-3">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <Popover open={open} onOpenChange={disabled ? () => {} : setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-[44px] px-4 border-[#D1D5DB] bg-white",
                !value && "text-muted-foreground",
                showClearButton && value && "pr-12"
              )}
            >
              <FontAwesomeIcon icon={faCalendar} className="mr-2 h-4 w-4" />
              {value ? renderValue() : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDateTime}
            onSelect={(date) => {
              const newDateTime = selectedDateTime ? new Date(selectedDateTime) : new Date();
              if (date) {
                newDateTime.setFullYear(date.getFullYear());
                newDateTime.setMonth(date.getMonth());
                newDateTime.setDate(date.getDate());
              }
              handleDateTimeChange(newDateTime);
            }}
            locale={th}
            defaultMonth={selectedDateTime ?? new Date()}
          />
          <div className="border-t border-border">
            <InputTimePicker
              date={selectedDateTime}
              setDate={handleDateTimeChange}
            />
          </div>

          {
            showConfirmButton &&
            (
              <div className="border-t border-border p-2">
                <Button
                  onClick={handleConfirm}
                  className="w-full bg-[#671fab] hover:bg-[#671fab] text-white cursor-pointer"
                  size="sm"
                >
                  ยืนยัน
                </Button>
              </div>
            )
          }
        </PopoverContent>
        </Popover>
        {showClearButton && value && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded hover:bg-red-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            disabled={disabled}
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default InputDateTimePicker;
