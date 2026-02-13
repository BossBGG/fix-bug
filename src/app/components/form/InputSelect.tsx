'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {Options} from "@/types";
import InputRadio from "@/app/components/form/InputRadio";
import { useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";
import {cn} from "@/lib/utils";

type InputSelectProps = {
  options: Options[],
  value: string;
  label?: string;
  placeholder: string;
  setData?: (value: string | number) => void;
  disabled?: boolean;
  className?: string;
}

const InputSelect = ({
                       value,
                       options,
                       label,
                       placeholder,
                       setData,
                       disabled=false,
                       className
                     }: InputSelectProps) => {
  const [expandIndex, setExpandIndex] = useState(-1);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [selectedSubValue, setSelectedSubValue] = useState<string | null>(null)
  const [selectedSubLabel, setSelectedSubLabel] = useState<string | null>(null)

  const handleChangeSubValue = (value: string, subOption: Options[] = []) => {
    const item = subOption.filter((sub) => value === sub.value)
    setSelectedSubValue(value)
    if (item?.length > 0) {
      setSelectedSubLabel(item[0].label)
    }

    // เพิ่มบรรทัดนี้เพื่ออัพเดทค่าไปยัง parent component
    if(setData) {
      setData(value)
    }
  }

  const handleChangeSelect = (value: number | string) => {
    if(setData) {
      setData(value)
    }
  }

  useEffect(() => {
    const valueSelected = options.filter((option: Options) => option.value == value)
    if (valueSelected?.length > 0) {
      setSelectedLabel(valueSelected[0].label)
    }
  }, [value]);

  useEffect(() => {
    let array_value = [];
    options.map((opt) => {
      if(opt.subOptions && opt.subOptions.length > 0) {
        array_value.push(opt.value)
      }
    })
  }, [options]);

  return (
    <Select onValueChange={handleChangeSelect}
            value={selectedSubValue || value}
            disabled={disabled}
    >
      {label && <div className="mb-2">{label}</div>}
      <SelectTrigger className={cn("w-full !h-[46px] bg-white", className || "")}>
        <SelectValue placeholder={placeholder}>
          {selectedSubLabel || selectedLabel}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="p-2">
        {
          options.map((option, index) => (
            <div key={index}>
              {option.subOptions && option.subOptions.length > 0 ? (
                <div
                  className="flex items-center cursor-pointer px-2 py-1"
                  onClick={() => {
                    setExpandIndex(expandIndex === index ? -1 : index)
                  }}
                >
                  {expandIndex === index ? (
                    <FontAwesomeIcon icon={faChevronDown} color="#57595B" />
                  ) : (
                    <FontAwesomeIcon icon={faChevronUp} color="#57595B" />
                  )}
                  <span className="ml-2">{option.label}</span>
                </div>
              ) : (
                <SelectItem value={option.value as string} className="cursor-pointer mb-1">
                  {option.label}
                </SelectItem>
              )}

              {
                option.subOptions
                && option.subOptions.length > 0
                && <div className={cn('py-1 px-8 block', expandIndex !== index && 'hidden')}>
                  <InputRadio options={option.subOptions}
                              value={value}
                              setData={(v: string) => handleChangeSubValue(v, option.subOptions)}/>
                </div>
              }
            </div>
          ))
        }
      </SelectContent>
    </Select>
  )
}

export default InputSelect;
