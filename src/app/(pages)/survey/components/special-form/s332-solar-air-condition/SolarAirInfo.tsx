import React, {useEffect, useState} from 'react';
import {Card} from "@/components/ui/card";
import InputText from "@/app/components/form/InputText";
import {Selection} from "@/app/components/form/Selection";
import {
  S332SolarAirSurveyData,
  Survey,
  WorkOrderSurveyData
} from "@/types";

interface SolarAirInfoProps {
  data: Survey;
  updateData?: (d: Survey) => void;
  disabled?: boolean
}

const SolarAirInfo: React.FC<SolarAirInfoProps> = ({
                                                               data,
                                                               updateData,
                                                               disabled = false
                                                             }) => {
  const [formData, setFormData] = useState<S332SolarAirSurveyData>({} as S332SolarAirSurveyData);

  useEffect(() => {
    setFormData(data?.surveyData?.serviceSpecificData as S332SolarAirSurveyData || {})
  }, [data.surveyData?.serviceSpecificData]);

  const wiringOptions = [
    {value: 'เหนือ', label: 'เหนือ'},
    {value: 'ใต้', label: 'ใต้'},
    {value: 'ตะวันออก', label: 'ตะวันออก'},
    {value: 'ตะวันตก', label: 'ตะวันตก'}
  ];

  const handleChange = (field: keyof S332SolarAirSurveyData, value: string | number) => {
    const newData = {...formData, [field]: value};
    setFormData(newData);

    let surveyData: Survey = {
      ...data,
      surveyData: {
        ...data.surveyData as WorkOrderSurveyData,
        serviceSpecificData: {
          ...newData
        } as S332SolarAirSurveyData
      }
    }

    updateData?.(surveyData);
  };

  return (
    <Card className="p-4 mb-3">
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/2 px-2 mb-3">
          <InputText value={formData.refrigerant_pipe_length_m as number}
                     numberOnly={true}
                     onChange={(value: string) => handleChange('refrigerant_pipe_length_m', parseInt(value) || 0)}
                     label={"ระยะท่อน้ำยาแอร์ (จากคอยล์ร้อนถึงคอยล์เย็น) ประมาณ"}
                     labelUnit={"เมตร"}
                     placeholder={"ระยะท่อน้ำยาแอร์"}
                     disabled={disabled}
          />
        </div>

        <div className="w-full md:w-1/2 px-2 mb-3">
          <InputText value={formData.dc_cable_length_m as number}
                     numberOnly={true}
                     onChange={(value: string) => handleChange('dc_cable_length_m', parseInt(value) || 0)}
                     label={"ระยะสายไฟ DC (จากแผงโซลาร์เซลล์ถึงคอยส่วยร่อน) ประมาณ"}
                     labelUnit={"เมตร"}
                     placeholder={"ระยะสายไฟ DC"}
                     disabled={disabled}
          />
        </div>

        <div className="w-full md:w-1/2 mb-3">
          <InputText value={formData.ac_cable_length_m as number}
                     numberOnly={true}
                     onChange={(value: string) => handleChange('ac_cable_length_m', parseInt(value) || 0)}
                     label={"ระยะสายไฟ AC (จากตู้ไฟถึงคอยล์ร้อน)"}
                     labelUnit={"เมตร"}
                     placeholder={"ระยะสายไฟ AC"}
                     disabled={disabled}
          />
        </div>

        <div className="px-2 w-full md:w-1/2">
          <div className="mb-3">
            หน้าบ้านหันทิศ
          </div>
          <Selection value={formData.house_facing_direction as string}
                     options={wiringOptions}
                     placeholder={"หน้าบ้านหันทิศ"}
                     onUpdate={(value: string) => handleChange('house_facing_direction', value)}
                     disabled={disabled}
          />
        </div>
      </div>
    </Card>
  );
};

export default SolarAirInfo;
