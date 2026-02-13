import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Options,
  BusinessTypeObj,
  WorkOrderObj,
  BusinessTypeOnlyData,
  Survey,
  BusinessTypeSurveyData,
} from "@/types";
import { Selection } from "@/app/components/form/Selection";
import handleSearchBusinessType from "@/app/helpers/SearchBusinessType";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

interface BusinessTypeProps {
  data: WorkOrderObj | Survey;
  updateData?: (d: WorkOrderObj | Survey) => void;
  survey?: boolean;
  businessOptions: Options[];
  onUpdateOptions?: (opts: Options[]) => void;
  disabled?: boolean;
  isWorkOrderSurvey?: boolean;
}

const BusinessType: React.FC<BusinessTypeProps> = ({
  data,
  updateData,
  survey = true,
  businessOptions,
  onUpdateOptions,
  disabled = false,
  isWorkOrderSurvey = false,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  useEffect(() => {
    const serviceSpecData = (data as WorkOrderObj)
      .serviceSpecificData as BusinessTypeOnlyData;
    setSelectedValue(serviceSpecData?.businessTypeId);
  }, [(data as WorkOrderObj).serviceSpecificData]);

  useEffect(() => {
    if (isWorkOrderSurvey) {
      const surveyData = (data as Survey).surveyData;
      setSelectedValue(
        (surveyData?.serviceSpecificData as BusinessTypeSurveyData)
          ?.business_type_id || ""
      );
    }
  }, [(data as Survey).surveyData?.serviceSpecificData]);

  const handleUpdate = (value: string, item: BusinessTypeObj) => {
    setSelectedValue(value);
    const workOrderData = data;
    let items = {};
    if (!isWorkOrderSurvey) {
      items = {
        serviceSpecificData: {
          ...(workOrderData as WorkOrderObj).serviceSpecificData,
          businessTypeId: value,
        },
      };
    } else {
      items = {
        surveyData: {
          ...(workOrderData as Survey).surveyData,
          serviceSpecificData: {
            ...(workOrderData as Survey).surveyData?.serviceSpecificData,
            business_type_id: value,
          },
        },
      };
    }

    let newData = {
      ...data,
      ...items,
    };

    updateData?.(newData as any);
  };

  return (
    <>
      {survey && (
        <div>
          <div className="space-y-2">
            <Label htmlFor="business-type" className="font-medium text-[16px]">
              ประเภทธุรกิจ
            </Label>
            <CustomTooltip 
              fieldValue={businessOptions.find(opt => opt.value === selectedValue)?.label}
              fieldLabel="ประเภทธุรกิจ"
            >
              <Selection
                value={selectedValue}
                options={businessOptions}
                placeholder={"เลือกประเภทธุรกิจ"}
                onSearch={handleSearchBusinessType}
                onUpdate={handleUpdate}
                onUpdateOptions={onUpdateOptions}
                disabled={disabled}
              />
            </CustomTooltip>
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessType;
