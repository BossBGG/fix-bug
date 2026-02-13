import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  InverterData,
  RequestServiceDetail,
  S332SolarBatteryData,
  WorkOrderObj,
} from "@/types";
import InputText from "@/app/components/form/InputText";
import {CustomTooltip} from "@/components/ui/custom-tooltip";

interface InverterComponentProps {
  data: WorkOrderObj;
  updateData?: (d: WorkOrderObj) => void;
  disabled?: boolean;
}

const InverterComponent: React.FC<InverterComponentProps> = ({
  data,
  updateData,
  disabled = false,
}) => {
  const [formData, setFormData] = useState<S332SolarBatteryData>(
    {} as S332SolarBatteryData
  );

  useEffect(() => {
    setFormData((data?.serviceSpecificData as S332SolarBatteryData) || {});
  }, [data.serviceSpecificData]);

  const handleChange = (
    field: keyof S332SolarBatteryData,
    value: string | number
  ) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    handleUpdateData(newData);
  };

  const handleConnectionTypeChange = (value: string) => {
    const connectionType = value as "LAN" | "WiFi" | "other";
    handleChange("networkConnectionTypeId", connectionType);

    if (connectionType !== "other") {
      handleChange("networkConnectionTypeOther", "");
    }

    let newData: S332SolarBatteryData = {
      ...formData,
      networkConnectionTypeId: connectionType,
      networkConnectionTypeOther: "",
    };
    handleUpdateData(newData);
  };

  const handleUpdateData = (inverter: S332SolarBatteryData) => {
    let newData = {
      ...data,
      serviceSpecificData: {
        ...(data.serviceSpecificData as S332SolarBatteryData),
        ...inverter,
      },
    };

    updateData?.(newData);
  };

  return (
    <div className="bg-white rounded-lg  border-1 border-[#E1D2FF]  p-4 mb-4 shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div>ระยะจากแผงโซลาร์สำหรับ ถึง อินเวอร์เตอร์</div>
          <div className="relative">
            <CustomTooltip fieldValue={formData.distancePanelToInverterM?.toString()} fieldLabel="ระยะจากแผงโซลาร์สำหรับ ถึง อินเวอร์เตอร์">
              <Input
                id="ac-voltage"
                type="number"
                value={formData.distancePanelToInverterM || ""}
                onChange={(e) =>
                  handleChange(
                    "distancePanelToInverterM",
                    parseInt(e.target.value) || 0
                  )
                }
                className="pr-12 h-[44px]"
                min="0"
                disabled={disabled}
              />
            </CustomTooltip>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              เมตร
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div>ระยะจากอินเวอร์เตอร์ ถึง ตู้ไฟฟ้า</div>
          <div className="relative">
            <CustomTooltip fieldValue={formData.distanceInverterToDistributionM?.toString()} fieldLabel="ระยะจากอินเวอร์เตอร์ ถึง ตู้ไฟฟ้า">
              <Input
                id="dc-voltage"
                type="number"
                value={formData.distanceInverterToDistributionM || ""}
                onChange={(e) =>
                  handleChange(
                    "distanceInverterToDistributionM",
                    parseInt(e.target.value) || 0
                  )
                }
                className="pr-12 h-[44px]"
                min="0"
                disabled={disabled}
              />
            </CustomTooltip>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              เมตร
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div>ระบบเครือข่ายอินเตอร์เน็ต</div>

        <RadioGroup
          value={formData.networkConnectionTypeId}
          onValueChange={disabled ? () => {} : handleConnectionTypeChange}
          className="flex flex-wrap gap-10 ps-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="LAN"
              id="lan"
              className="text-purple-600 border-purple-300 focus:ring-purple-500"
            />
            <Label htmlFor="lan" className="text-sm font-medium cursor-pointer">
              LAN
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="WiFi"
              id="wifi"
              className="text-purple-600 border-purple-300 focus:ring-purple-500"
            />
            <Label
              htmlFor="wifi"
              className="text-sm font-medium cursor-pointer"
            >
              WiFi
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="other"
              id="other"
              className="text-purple-600 border-purple-300 focus:ring-purple-500"
            />
            <Label
              htmlFor="other"
              className="text-sm font-medium cursor-pointer"
            >
              อื่นๆ
            </Label>
          </div>
          {formData.networkConnectionTypeId === "other" && (
            <div className="w-full lg:w-[69%] xl:w-[31%]">
              <InputText
                value={formData.networkConnectionTypeOther || ""}
                placeholder="ระบุ"
                onChange={(value: string) =>
                  handleChange("networkConnectionTypeOther", value)
                }
                disabled={disabled}
              />
            </div>
          )}
        </RadioGroup>
      </div>
    </div>
  );
};

export default InverterComponent;
