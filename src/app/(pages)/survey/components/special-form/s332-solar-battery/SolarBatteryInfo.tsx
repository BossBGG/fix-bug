import React, {useEffect, useState} from 'react';
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {S332SolarBatterySurveyData, Survey, WorkOrderSurveyData} from "@/types";
import InputText from "@/app/components/form/InputText";

interface SolarBatteryInfoProps {
  data: Survey;
  updateData?: (d: Survey) => void;
  disabled?: boolean;
}

const SolarBatteryInfo: React.FC<SolarBatteryInfoProps> = ({
                                                               data,
                                                               updateData,
                                                               disabled = false
                                                             }) => {
  const [formData, setFormData] = useState<S332SolarBatterySurveyData>({} as S332SolarBatterySurveyData);

  useEffect(() => {
    setFormData(data?.surveyData?.serviceSpecificData as S332SolarBatterySurveyData || {});
  }, [data.surveyData?.serviceSpecificData]);

  const handleChange = (field: keyof S332SolarBatterySurveyData, value: string | number) => {
    const newData = {...formData, [field]: value};
    setFormData(newData);
    handleUpdateData(newData)
  };

  const handleConnectionTypeChange = (value: string) => {
    const connectionType = value as 'LAN' | 'WiFi' | 'other';
    handleChange('internet_conn_type', connectionType);


    if (connectionType !== 'other') {
      handleChange('internet_conn_remark', '');
    }

    let newData: S332SolarBatterySurveyData = {
      ...formData,
      internet_conn_type: connectionType,
      internet_conn_remark: ''
    };
    handleUpdateData(newData)
  };

  const handleUpdateData = (inverter: S332SolarBatterySurveyData) => {
    let newData = {
      ...data,
      surveyData: {
        ...data.surveyData as WorkOrderSurveyData,
        serviceSpecificData: {
          ...inverter
        } as S332SolarBatterySurveyData
      }
    }

    updateData?.(newData);
  }

  return (
    <div className="bg-white rounded-lg  border-1 border-[#E1D2FF]  p-4 mb-4 shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-2">
          <div>
            ระยะจากแผงโซลาร์สำหรับ ถึง อินเวอร์เตอร์
          </div>
          <div className="relative">
            <Input
              id="ac-voltage"
              type="number"
              value={formData.pv_to_inverter_dist_m || ""}
              onChange={(e) => handleChange('pv_to_inverter_dist_m', parseInt(e.target.value) || 0)}
              className="pr-12 h-[44px]"
              min="0"
              disabled={disabled}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              เมตร
            </span>
          </div>
        </div>


        <div className="space-y-2">
          <div>
            ระยะจากอินเวอร์เตอร์ ถึง ตู้ไฟฟ้า
          </div>
          <div className="relative">
            <Input
              id="dc-voltage"
              type="number"
              value={formData.inverter_to_mdb_dist_m || ""}
              onChange={(e) => handleChange('inverter_to_mdb_dist_m', parseInt(e.target.value) || 0)}
              className="pr-12 h-[44px]"
              min="0"
              disabled={disabled}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              เมตร
            </span>
          </div>
        </div>
      </div>


      <div className="mt-6 space-y-3">
        <div>
          ระบบเครือข่ายอินเตอร์เน็ต
        </div>

        <RadioGroup
          value={formData.internet_conn_type}
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
            <Label htmlFor="wifi" className="text-sm font-medium cursor-pointer">
              WiFi
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="other"
              id="other"
              className="text-purple-600 border-purple-300 focus:ring-purple-500"
            />
            <Label htmlFor="other" className="text-sm font-medium cursor-pointer">
              อื่นๆ
            </Label>
          </div>
          {formData.internet_conn_type === 'other' && (
            <div className="w-full lg:w-[69%] xl:w-[31%]">
              <InputText value={formData.internet_conn_remark || ""}
                         placeholder="ระบุ"
                         onChange={(value: string) => handleChange('internet_conn_remark', value)}
                         disabled={disabled}
              />
            </div>
          )}
        </RadioGroup>
      </div>
    </div>
  );
};

export default SolarBatteryInfo;
