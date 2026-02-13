import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import InputText from "@/app/components/form/InputText";
import { Selection } from "@/app/components/form/Selection";
import {
  RequestServiceDetail,
  S332SolarAirData,
  SiteSurveyAirCondition,
  WorkOrderObj,
} from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DistanceComponentProps {
  data: WorkOrderObj;
  updateData?: (d: WorkOrderObj) => void;
  disabled?: boolean;
}

const DistanceComponent: React.FC<DistanceComponentProps> = ({
  data,
  updateData,
  disabled = false,
}) => {
  const [formData, setFormData] = useState<S332SolarAirData>(
    {} as S332SolarAirData
  );

  useEffect(() => {
    setFormData((data?.serviceSpecificData as S332SolarAirData) || {});
  }, [data.serviceSpecificData]);

  const wiringOptions = [
    { value: "เหนือ", label: "เหนือ" },
    { value: "ใต้", label: "ใต้" },
    { value: "ตะวันออก", label: "ตะวันออก" },
    { value: "ตะวันตก", label: "ตะวันตก" },
  ];

  const handleChange = (
    field: keyof S332SolarAirData,
    value: string | number
  ) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    let newWorkOrderData: WorkOrderObj = {
      ...data,
      serviceSpecificData: {
        ...(data.requestServiceDetail as S332SolarAirData),
        ...newData,
      },
    };

    updateData?.(newWorkOrderData);
  };

  return (
    <Card className="p-4 mb-3">
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/2 px-2 mb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <InputText
                  value={formData.pipeLengthRefrigerantM as number}
                  numberOnly={true}
                  onChange={(value: string) =>
                    handleChange("pipeLengthRefrigerantM", parseInt(value) || 0)
                  }
                  label={"ระยะท่อน้ำยาแอร์ (จากคอยล์ร้อนถึงคอยล์เย็น) ประมาณ"}
                  labelUnit={"เมตร"}
                  placeholder={"ระยะท่อน้ำยาแอร์"}
                  disabled={disabled}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              ระยะท่อน้ำยาแอร์ (จากคอยล์ร้อนถึงคอยล์เย็น) ประมาณ
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-full md:w-1/2 px-2 mb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <InputText
                  value={formData.cableLengthDcM as number}
                  numberOnly={true}
                  onChange={(value: string) =>
                    handleChange("cableLengthDcM", parseInt(value) || 0)
                  }
                  label={
                    "ระยะสายไฟ DC (จากแผงโซลาร์เซลล์ถึงคอยส่วยร่อน) ประมาณ"
                  }
                  labelUnit={"เมตร"}
                  placeholder={"ระยะสายไฟ DC"}
                  disabled={disabled}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              ระยะสายไฟ DC (จากแผงโซลาร์เซลล์ถึงคอยส่วยร่อน) ประมาณ
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-full md:w-1/2 cableLengthAcM mb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <InputText
                  value={formData.cableLengthAcM as number}
                  numberOnly={true}
                  onChange={(value: string) =>
                    handleChange("cableLengthAcM", parseInt(value) || 0)
                  }
                  label={"ระยะสายไฟ AC (จากตู้ไฟถึงคอยล์ร้อน)"}
                  labelUnit={"เมตร"}
                  placeholder={"ระยะสายไฟ AC"}
                  disabled={disabled}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              ระยะสายไฟ AC (จากตู้ไฟถึงคอยล์ร้อน)
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="px-2 w-full md:w-1/2">
          <div className="mb-3">หน้าบ้านหันทิศ</div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Selection
                  value={formData.houseFacingDirection as string}
                  options={wiringOptions}
                  placeholder={"หน้าบ้านหันทิศ"}
                  onUpdate={(value: string) =>
                    handleChange("houseFacingDirection", value)
                  }
                  disabled={disabled}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              หน้าบ้านหันทิศ
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
};

export default DistanceComponent;
