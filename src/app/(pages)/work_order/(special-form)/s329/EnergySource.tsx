import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppSelector } from "@/app/redux/hook";
import {
  Options,
  RenewableType,
  RequestServiceDetail,
  S329ServiceData,
  WorkOrderObj,
} from "@/types";
import { Selection } from "@/app/components/form/Selection";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnergySourceProps {
  data: WorkOrderObj;
  options: Options[];
  onUpdate?: (d: WorkOrderObj) => void;
  disabled?: boolean;
}

const EnergySource: React.FC<EnergySourceProps> = ({
  data,
  options,
  onUpdate,
  disabled = false,
}: EnergySourceProps) => {
  const [selectedType, setSelectedType] = useState("");
  const [energyOptions, setEnergyOptions] = useState<Options[]>(options);

  useEffect(() => {
    let serviceSpec = data.serviceSpecificData as S329ServiceData;
    setSelectedType(serviceSpec?.renewableType);
  }, [data.serviceSpecificData]);

  useEffect(() => {
    setEnergyOptions(options);
  }, [options]);

  const handleTypeChange = (value: string, item: RenewableType) => {
    let newData = data;

    newData = {
      ...newData,
      serviceSpecificData: {
        ...(newData.serviceSpecificData as S329ServiceData),
        renewableType: value,
      },
    };

    setSelectedType(value);
    onUpdate?.(newData);
  };

  return (
    <div className="p-4 border-1 mb-4 rounded-lg shadow-md">
      <div className="space-y-2">
        <Label htmlFor="energy-source" className="font-medium text-[16px] mb-3">
          แหล่งที่มาของพลังงานหมุนเวียนที่ต้องการ
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Selection
                value={selectedType}
                options={energyOptions}
                placeholder={"แหล่งที่มาของพลังงานหมุนเวียนที่ต้องการ"}
                onUpdate={handleTypeChange}
                disabled={disabled}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            แหล่งที่มาของพลังงานหมุนเวียนที่ต้องการ
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default EnergySource;
