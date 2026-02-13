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
import { Selection } from "@/app/components/form/Selection";
import {
  Options,
  RenewableSource,
  RequestServiceDetail,
  S329ServiceData,
  WorkOrderObj,
} from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnergyRequirementProps {
  data: WorkOrderObj;
  onUpdate?: (d: WorkOrderObj) => void;
  options: Options[];
  disabled?: boolean;
}

const EnergyRequirement: React.FC<EnergyRequirementProps> = ({
  data,
  onUpdate,
  options,
  disabled = false,
}) => {
  const [selectedSurvey, setSelectedSurvey] = useState("");
  const [energyOptions, setEnergyOptions] = useState<Options[]>(options);

  useEffect(() => {
    let serviceSpec = data.serviceSpecificData as S329ServiceData;
    setSelectedSurvey(serviceSpec?.renewableSource);
  }, [data.serviceSpecificData]);

  useEffect(() => {
    setEnergyOptions(options);
  }, [options]);

  const handleSurveyChange = (value: string, item: RenewableSource) => {
    let newData = data;

    newData = {
      ...newData,
      serviceSpecificData: {
        ...(newData.serviceSpecificData as S329ServiceData),
        renewableSource: value,
      },
    };

    setSelectedSurvey(value);
    onUpdate?.(newData);
  };

  return (
    <div className="p-4 border-1 mb-4 rounded-lg shadow-md">
      <div className="space-y-4">
        {/* สำรวจความต้องการใช้พลังงานสะอาด */}
        <div className="space-y-2">
          <Label
            htmlFor="survey-requirement"
            className="font-medium text-[16px] mb-3"
          >
            สำรวจความต้องการใบรับรองการผลิตพลังงานหมุนเวียน
          </Label>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Selection
                  value={selectedSurvey}
                  options={energyOptions}
                  placeholder={"ต้องการสำรวจพลังงานแสงอาทิตย์"}
                  onUpdate={handleSurveyChange}
                  disabled={disabled}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              สำรวจความต้องการใบรับรองการผลิตพลังงานหมุนเวียน
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default EnergyRequirement;
