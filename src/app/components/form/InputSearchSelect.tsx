'use client'

import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {useEffect, useMemo, useRef, useState} from "react";
import {Options} from "@/types";
import {Check, ChevronsUpDown} from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from "@/components/ui/command";
import {cn} from "@/lib/utils";
import debounce from "lodash/debounce";

interface InputSearchSelectProps {
  selectOptions: Options[],
  fetchOptions: (search: string) => void,
  onChange: (val: string) => void,
  loading: boolean,
  value: string,
  placeholder?: string
}

const InputSearchSelect = ({
                             onChange,
                             selectOptions,
                             fetchOptions,
                             loading,
                             value,
                             placeholder
                           }: InputSearchSelectProps) => {
  const [open, setOpen] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const searchDebounce = useMemo(() => debounce((s: string) => {
    if (s.trim().length >= 3 || s.trim().length === 0) {
      fetchOptions(s)
    }
  }, 500), [fetchOptions])

  useEffect(() => {
    if (buttonRef.current) {
      setContentWidth(buttonRef.current.offsetWidth);
    }
  }, [buttonRef.current, selectOptions]);

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between h-[45] w-full"
          >
            {value
              ? selectOptions.find((opt) => opt.value === value)?.label
              : placeholder || "เลือกตัวเลือก..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-1" align="start" style={{minWidth: contentWidth}}>
          <Command>
            <CommandInput
              placeholder="พิมพ์เพื่อค้นหา..."
              onValueChange={(val: string) => {
                setSearch(val)
                searchDebounce(val)
              }}
              value={search}
            />
            <CommandList className="max-h-60 overflow-y-auto"
                         onWheel={(e) => e.stopPropagation()}>
              {loading && <div className="p-2 text-sm">กำลังโหลด...</div>}
              {!loading && selectOptions.length === 0 && (
                <CommandEmpty>ไม่พบข้อมูล</CommandEmpty>
              )}
              {selectOptions.map((opt, idx) => (
                <p
                  key={`${opt.value}-${idx}`}
                  className="cursor-pointer p-2 hover:bg-gray-100 flex justify-between items-center"
                  onClick={() => {
                    onChange(opt.value as string)
                    setOpen(false)
                  }}
                >
                  {opt.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === opt.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </p>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default InputSearchSelect;
