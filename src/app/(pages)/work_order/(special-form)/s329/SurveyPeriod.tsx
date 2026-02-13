import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/app/redux/hook";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { RequestServiceDetail, S329ServiceData, WorkOrderObj } from "@/types";
import InputText from "@/app/components/form/InputText";
import InputDateButton from "@/app/components/form/InputDateButton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SurveyPeriodProps {
  data: WorkOrderObj;
  onUpdate?: (d: WorkOrderObj) => void;
  disabled?: boolean;
}

const SurveyPeriod: React.FC<SurveyPeriodProps> = ({
  data,
  onUpdate,
  disabled = false,
}) => {
  const [selectedYear, setSelectedYear] = useState<Date | undefined>();
  const [period, setPeriod] = useState<number>(0);

  useEffect(() => {
    let serviceSpec = data.serviceSpecificData as S329ServiceData;
    let year = serviceSpec?.year ? new Date(serviceSpec.year) : new Date();
    setSelectedYear(year);
    setPeriod(serviceSpec?.qty || 0);
  }, [data.serviceSpecificData]);

  const handleYearChange = (date: Date | undefined) => {
    setSelectedYear(date);

    handelUpdateData("year", date);
  };

  const handlePeriodChange = (value: number) => {
    setPeriod(value);
    handelUpdateData("qty", value);
  };

  const handelUpdateData = (
    key: keyof S329ServiceData,
    value: string | number | Date | undefined
  ) => {
    let workOrder = data;
    workOrder = {
      ...workOrder,
      serviceSpecificData: {
        ...(data.serviceSpecificData as S329ServiceData),
        [key]: value,
      },
    };

    onUpdate?.(workOrder);
  };

  // Desktop Layout
  return (
    <div className="p-4 border-1 mb-4 rounded-lg shadow-md">
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">
          ปีที่มีความต้องการใบรับรองการผลิตพลังงานหมุนเวียน
        </h4>

        <div className="flex flex-wrap">
          {/* เลือกปี */}
          <div className="w-full md:w-1/2 px-2 mb-3 md:mb-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <InputDateButton
                    label={"ปี พ.ศ."}
                    value={selectedYear}
                    formatDate={"dd MMMM "}
                    displayBuddhistYear={true}
                    onChange={handleYearChange}
                    disabled={disabled}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                ปี พ.ศ.
              </TooltipContent>
            </Tooltip>
          </div>

          {/* จำนวนปี */}
          <div className="w-full md:w-1/2 px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <InputText
                    value={period}
                    numberOnly={true}
                    onChange={(v: string) => handlePeriodChange(parseInt(v))}
                    placeholder={"จำนวนปี"}
                    label={"จำนวน (ปี)"}
                    disabled={disabled}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                จำนวนปี
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPeriod;
