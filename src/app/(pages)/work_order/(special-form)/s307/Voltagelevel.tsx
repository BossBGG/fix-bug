import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import BusinessType from "@/app/(pages)/work_order/(special-form)/component/work_execution/business_type";
import {
  BusinessTypeObj,
  Options,
  RequestServiceDetail,
  S307ServiceData,
  TransFormerVoltage,
  WorkOrderObj,
} from "@/types";
import { Selection } from "@/app/components/form/Selection";
import {CustomTooltip} from "@/components/ui/custom-tooltip";

interface VoltageLevelProps {
  survey?: boolean;
  businessTypeOptions: Options[];
  voltagesOptions: Options[];
  onUpdateBusinessTypeOptions: (opts: Options[]) => void;
  data: WorkOrderObj;
  onUpdateData?: (d: WorkOrderObj) => void;
  disabled?: boolean;
}

const VoltageLevel: React.FC<VoltageLevelProps> = ({
  survey = true,
  businessTypeOptions,
  voltagesOptions,
  onUpdateBusinessTypeOptions,
  data,
  onUpdateData,
  disabled = false,
}) => {
  const [requestServiceData, setRequestServiceData] = useState<S307ServiceData>(
    {} as S307ServiceData
  );

  useEffect(() => {
    let serviceSpecData = data.serviceSpecificData as S307ServiceData;
    setRequestServiceData(serviceSpecData || {});
  }, [data.serviceSpecificData]);

  const handleVoltageChange = (value: string) => {
    let reqServiceDetail: S307ServiceData = {
      ...requestServiceData,
      voltageId: value,
    };
    setRequestServiceData(reqServiceDetail);
    handelUpdateData(reqServiceDetail);
  };

  const handelUpdateData = (reqService: S307ServiceData) => {
    let newData = {
      ...data,
      serviceSpecificData: reqService,
    };
    onUpdateData?.(newData);
  };

  return (
    <div className="p-4 border-1 mb-4 rounded-lg shadow-md">
      <div className="flex flex-wrap">
        {/* ประเภทธุรกิจ */}
        {survey && (
          <div className="w-full md:w-1/2 px-2">
            <BusinessType
              data={data || ({} as WorkOrderObj)}
              updateData={(d) => onUpdateData?.(d as WorkOrderObj)}
              onUpdateOptions={onUpdateBusinessTypeOptions}
              businessOptions={businessTypeOptions}
              disabled={disabled}
            />
          </div>
        )}

        {/* ระดับแรงดันไฟฟ้า */}
        <div className="space-y-2 w-full md:w-1/2 px-2 mt-3 md:mt-0">
          <Label htmlFor="voltage-level" className="font-medium text-[16px]">
            ระดับแรงดันไฟฟ้า
          </Label>
          <CustomTooltip fieldValue={voltagesOptions.find(opt => opt.value === requestServiceData?.voltageId)?.label} fieldLabel="ระดับแรงดันไฟฟ้า">
            <Selection
              value={requestServiceData?.voltageId || ""}
              options={voltagesOptions}
              placeholder={"เลือกระดับแรงดันไฟฟ้า"}
              onUpdate={handleVoltageChange}
              disabled={disabled}
            />
          </CustomTooltip>
        </div>
      </div>
    </div>
  );
};

export default VoltageLevel;
