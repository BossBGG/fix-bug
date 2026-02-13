import React, { useEffect, useState } from "react";
import BusinessType from "@/app/(pages)/work_order/(special-form)/component/work_execution/business_type";
import { Options, S308ServiceData, WorkOrderObj, Survey } from "@/types";
import InputText from "@/app/components/form/InputText";
import {CustomTooltip} from "@/components/ui/custom-tooltip";

interface TransformerSizeProps {
  data: WorkOrderObj;
  businessOptions: Options[];
  updateData: (d: WorkOrderObj | Survey) => void;
  disabled?: boolean;
}

const TransformerSize: React.FC<TransformerSizeProps> = ({
  data,
  businessOptions,
  updateData,
  disabled = false,
}) => {
  const [transformerSize, setTransformerSize] = useState<number>(0);

  useEffect(() => {
    let serviceSpecificData = data?.serviceSpecificData as S308ServiceData;
    if (serviceSpecificData?.transformerCapacityKw) {
      setTransformerSize(serviceSpecificData.transformerCapacityKw);
    }
  }, [data?.serviceSpecificData]);

  const handleTransformerSizeChange = (value: string) => {
    setTransformerSize(parseInt(value));
    updateData({
      ...data,
      serviceSpecificData: {
        ...data.serviceSpecificData,
        transformerCapacityKw: parseInt(value),
      } as S308ServiceData,
    });
  };

  // Desktop Layout
  return (
    <div className="p-4 border-1 mb-4 rounded-lg shadow-md">
      <div className="grid grid-cols-2 gap-4">
        <BusinessType
          data={data}
          businessOptions={businessOptions}
          updateData={(d) => updateData(d as WorkOrderObj)}
          disabled={disabled}
        />

        {/* ขนาดหม้อแปลงที่ติดตั้งรวม */}
        <div className="space-y-2">
          <div className="mb-2">ขนาดหม้อแปลงที่ติดตั้งรวม (kVA)</div>
          <CustomTooltip fieldValue={transformerSize?.toString()} fieldLabel="ขนาดหม้อแปลงที่ติดตั้งรวม (kVA)">
            <InputText
              value={transformerSize}
              onChange={handleTransformerSizeChange}
              placeholder="ระบุขนาดหม้อแปลง"
              numberOnly={true}
              disabled={disabled}
            />
          </CustomTooltip>
        </div>
      </div>
    </div>
  );
};
export default TransformerSize;
