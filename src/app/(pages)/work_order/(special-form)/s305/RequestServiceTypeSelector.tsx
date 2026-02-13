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
import { Options, S305ServiceData, WorkOrderObj } from "@/types";
import { Selection } from "@/app/components/form/Selection";
import { Card } from "@/components/ui/card";
import { handleSearchRequestService } from "@/app/helpers/SearchRequestService";
import { handleSearchServiceType } from "@/app/helpers/SearchServiceType";
import {CustomTooltip} from "@/components/ui/custom-tooltip";

interface RequestServiceTypeSelectorProps {
  data: WorkOrderObj;
  updateData: (d: WorkOrderObj) => void;
  requestServiceOptions: Options[];
  onUpdateRequestServiceOptions: (opts: Options[]) => void;
  serviceTypesOptions: Options[];
  onUpdateServiceTypesOptions: (opts: Options[]) => void;
  reqCode: string;
  disabled?: boolean;
}

const RequestServiceTypeSelector: React.FC<RequestServiceTypeSelectorProps> = ({
  data,
  updateData,
  requestServiceOptions,
  onUpdateRequestServiceOptions,
  serviceTypesOptions,
  onUpdateServiceTypesOptions,
  reqCode,
  disabled = true,
}) => {
  const [selectedRequestType, setSelectedRequestType] = useState<string>();
  const [selectedServiceType, setSelectedServiceType] = useState<string>();

  useEffect(() => {
    let serviceSpecData = data.serviceSpecificData as S305ServiceData;
    setSelectedRequestType(serviceSpecData?.requestServiceTypeId || "");
    setSelectedServiceType(serviceSpecData?.requestServiceId || "");
  }, [data.serviceSpecificData]);

  const handleRequestTypeChange = (value: string) => {
    setSelectedRequestType(value);
    handleUpdateData("requestServiceTypeId", value);
  };

  const handleServiceTypeChange = (value: string) => {
    setSelectedServiceType(value);
    handleUpdateData("requestServiceId", value);
  };

  const handleUpdateData = (key: keyof S305ServiceData, value: string) => {
    let newData = data;
    newData = {
      ...newData,
      serviceSpecificData: {
        ...newData.serviceSpecificData,
        [key]: value,
      },
    };
    updateData?.(newData);
  };

  return (
    <Card className="px-2 py-4 mb-4">
      <div className="flex flex-wrap">
        {/* ประเภทคำร้อง */}
        <div className="w-full md:w-1/2 mb-3 md:mb-0 px-2">
          <Label htmlFor="request-type" className="text-[16px] mb-3">
            ประเภทคำร้อง
          </Label>
          <CustomTooltip fieldValue={requestServiceOptions.find(opt => opt.value === selectedRequestType)?.label} fieldLabel="ประเภทคำร้อง">
            <Selection
              value={selectedRequestType as string}
              options={requestServiceOptions}
              placeholder={"ประเภทคำร้อง"}
              onUpdate={handleRequestTypeChange}
              onSearch={(s: string) =>
                handleSearchRequestService(s, reqCode)
              }
              onUpdateOptions={onUpdateRequestServiceOptions}
              disabled={disabled}
            />
          </CustomTooltip>
        </div>

        {/* ประเภทการให้บริการ */}
        <div className="w-full md:w-1/2 px-2">
          <Label htmlFor="service-type" className="text-[16px] mb-3">
            ประเภทการให้บริการ
          </Label>
          <CustomTooltip fieldValue={serviceTypesOptions.find(opt => opt.value === selectedServiceType)?.label} fieldLabel="ประเภทการให้บริการ">
            <Selection
              value={selectedServiceType as string}
              options={serviceTypesOptions}
              placeholder={"ประเภทการให้บริการ"}
              onUpdate={handleServiceTypeChange}
              onSearch={(s: string) => handleSearchServiceType(s, reqCode)}
              onUpdateOptions={onUpdateServiceTypesOptions}
              disabled={disabled}
            />
          </CustomTooltip>
        </div>
      </div>
    </Card>
  );
};

export default RequestServiceTypeSelector;
