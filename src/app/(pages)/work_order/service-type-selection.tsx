import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown, faXmark} from "@fortawesome/free-solid-svg-icons";
import InputGroupCheckbox from "@/app/components/form/InputGroupCheckbox";
import React, {useEffect, useRef, useState} from "react";
import {Options} from "@/types";
import {useAppSelector} from "@/app/redux/hook";

interface ServiceTypeSelectionProps {
  options: Options[],
  setData: (service: string[]) => void,
  selected: string[]
}

const ServiceTypeSelection = ({
                                options,
                                setData,
                                selected
                              }: ServiceTypeSelectionProps) => {
  const [serviceTypeSelected, setServiceTypeSelected] = useState<string[]>([]);
  const screen_size = useAppSelector((state) => state.screen_size)
  const removeSelected = (val: string) => {
    let option = options.find(option => option.value === val);
  }
  const popoverTriggerRef = useRef<HTMLButtonElement>(null)
  const [popoverWidth, setPopoverWidth] = useState(0);

  useEffect(() => {
    setServiceTypeSelected(selected);
  }, [selected]);

  useEffect(() => {
    if(popoverTriggerRef.current){
      setPopoverWidth(popoverTriggerRef.current.offsetWidth)
    }
  },[popoverTriggerRef])

  const handleCheck = (d: string[]) => {
    console.log('d >>> ', d)
    setServiceTypeSelected(d);
    setData(d);
  }

  const renderSelectedSubValue = (value: string) => {
    let label = ""
    options.map((opts) => {
      opts.subOptions?.map((sub) => {
        if(sub.value == value){
          label = sub.label;
        }
      })
    })

    return label;
  }

  return (
    <div>
      <div className="mb-3">ประเภทงานบริการ</div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline"
                  className="w-full justify-between cursor-pointer h-full flex"
                  ref={popoverTriggerRef}
          >
            <div className="flex flex-wrap text-[#1F2024]">
              {serviceTypeSelected.length > 0
                ? serviceTypeSelected.map((val, index) => {
                  if (options && options.length > 0) {
                    const isParent = options.find((serviceType) => serviceType.value == val)
                    if (!isParent) {
                      return <div className="bg-[#E4DCFF] px-2 py-1 rounded-sm m-1"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                  }}
                                  key={`service-type-${val}-index-${index}`}
                      >
                        {renderSelectedSubValue(val)}
                        {/*<span><FontAwesomeIcon icon={faXmark} onClick={() => removeSelected(val)}/> </span>*/}
                      </div>
                    }
                  }
                })
                : <span className="text-[#AAAAAA] py-[5]">เลือกประเภทงานบริการ</span>
              }
            </div>
            <FontAwesomeIcon icon={faChevronDown}/>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-h-[300px] overflow-y-auto test-class max-w-[100%]"
                        style={{
                          width: popoverWidth ? popoverWidth + 'px' : 'auto',
                        }}
                        align="start"
                        onWheel={(e) => e.stopPropagation()}
        >
          <InputGroupCheckbox options={options}
                              setData={handleCheck}
                              showSelected={false}
                              searchable={false}
                              selectedValue={serviceTypeSelected}
          />
        </PopoverContent>
      </Popover>
    </div>

  )
}

export default ServiceTypeSelection;
