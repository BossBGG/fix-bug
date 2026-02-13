import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import PackageDetail from "./PackageDetail";
import { Selection } from "@/app/components/form/Selection";
import BusinessType from "@/app/(pages)/work_order/(special-form)/component/work_execution/business_type";
import { Card } from "@/components/ui/card";
import { Options, S322ServiceData, WorkOrderObj, Survey } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BusinessTypePackageProps {
  updateData?: (d: WorkOrderObj | Survey) => void;
  data: WorkOrderObj;
  currentStep?: number;
  survey?: boolean;
  businessTypeOptions: Options[];
  onUpdateBusinessTypeOptions?: (opts: Options[]) => void;
  disabled?: boolean;
}

// S322 Business Type Package Component
const BusinessTypePackage: React.FC<BusinessTypePackageProps> = ({
  updateData,
  data,
  currentStep = 0,
  survey = false,
  businessTypeOptions,
  onUpdateBusinessTypeOptions,
  disabled = false,
}) => {
  const [packageId, setPackage] = useState<string>();
  const [showPackageDetail, setShowPackageDetail] = useState(false);

  useEffect(() => {
    const serviceSpecData = data.serviceSpecificData as S322ServiceData;
    setPackage(serviceSpecData?.packageTitle || "");
  }, [data.serviceSpecificData]);

  const packageOptions = [
    {
      value: "package1",
      label: "Package 1 - ระบบไฟฟ้าแบบครบวงจร (35,000 บาท)",
    },
    {
      value: "package2",
      label: "Package 2 - ระบบไฟฟ้าแบบมาตรฐาน (25,000 บาท)",
    },
    {
      value: "package3",
      label: "Package 3 - ระบบไฟฟ้าแบบพื้นฐาน (20,000 บาท)",
    },
    {
      value: "package4",
      label: "Package 4 - ระบบไฟฟ้าแบบเบื้องต้น (10,000 บาท)",
    },
  ];

  const handlePackageSelect = (packageId: string) => {
    setPackage(packageId);
    handleUpdateData("packageTitle", packageId);
  };

  const handleUpdateData = (key: keyof S322ServiceData, value: string) => {
    let newData = data;
    newData = {
      ...newData,
      serviceSpecificData: {
        ...(newData.serviceSpecificData as S322ServiceData),
        [key]: value,
      },
    };
    updateData?.(newData);
  };

  return (
    <Card className="px-2 py-4">
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/2 px-2 mb-3 md:mb-0">
          <BusinessType
            data={data}
            businessOptions={businessTypeOptions}
            onUpdateOptions={onUpdateBusinessTypeOptions}
            updateData={(d) => updateData?.(d as WorkOrderObj)}
            disabled={disabled}
          />
        </div>

        <div className="w-full md:w-1/2 px-2">
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="business-type" className="font-medium text-[16px]">
              เลือกแพ็กเกจบริการ
            </Label>

            <button
              onClick={() => setShowPackageDetail(true)}
              className="text-purple-600 hover:text-purple-800 underline cursor-pointer"
            >
              รายละเอียด Package
            </button>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Selection
                  value={packageId as string}
                  options={packageOptions}
                  placeholder={"เลือกแพ็กเกจบริการ"}
                  onUpdate={handlePackageSelect}
                  disabled={disabled}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              เลือกแพ็กเกจบริการ
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <PackageDetail
        isOpen={showPackageDetail}
        onClose={() => setShowPackageDetail(false)}
      />
    </Card>
  );
};

export default BusinessTypePackage;
