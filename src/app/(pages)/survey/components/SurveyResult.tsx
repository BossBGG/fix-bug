import React, { TextareaHTMLAttributes, useEffect, useState } from "react";
import { Options, Survey, WorkerOptionObj } from "@/types";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import InputRadio from "@/app/components/form/InputRadio";
import InputTextArea from "@/app/components/form/InputTextArea";
import { getWorkerListOptions } from "@/app/helpers/WorkerOptions";
import InputDateButton from "@/app/components/form/InputDateButton";
import { Selection } from "@/app/components/form/Selection";
import { CustomTooltip } from "@/components/ui/custom-tooltip";

type SurveyResultProps = {
  data: Survey;
  updateData: (d: Survey) => void;
};

const SurveyResult: React.FC<SurveyResultProps> = ({ data, updateData }) => {
  const [workerOptions, setWorkerOptions] = useState<Options[]>([]);

  useEffect(() => {
    fetchWorkerOptions();
  }, []);

  const fetchWorkerOptions = async () => {
    const options = await getWorkerListOptions();
    setWorkerOptions(options);
  };

  const resultOptions: Options[] = [
    { label: "ผ่าน", value: "S" },
    { label: "ไม่ผ่าน", value: "F" },
  ];

  const handleChange = (
    key: "status" | "note" | "appointment_date" | "survey_by",
    value: string | Date | undefined
  ) => {
    updateData({
      ...data,
      surveyData: {
        ...data.surveyData,
        [key]: value,
      },
    });
  };

  const handleChangeWorker = (value: string, item: WorkerOptionObj) => {
    let inOptionWorker = workerOptions.find((opt) => opt.value === value);
    if (!inOptionWorker) {
      workerOptions.push({
        value: value,
        label: `${item.username} - ${item.firstName} ${item.lastName}`,
        data: item,
      });
    }
    handleChange("survey_by", value);
  };

  return (
    <CardCollapse
      title={"สร้างแบบคำร้องขอติดตั้งระบบผลิตไฟฟ้าจากพลังงานแสงอาทิตย์"}
    >
      <div className="mb-4">
        <InputRadio
          options={resultOptions}
          value={data.surveyData?.status}
          className="flex"
          setData={(value: string) => handleChange("status", value)}
        />
      </div>

      <div>
        <CustomTooltip 
          fieldValue={data.surveyData?.note}
          fieldLabel="ผลสำรวจ"
          variant="textarea"
        >
          <InputTextArea
            label={"ผลสำรวจ"}
            data={data.surveyData?.note}
            onChange={(val: string) => handleChange("note", val)}
          />
        </CustomTooltip>
      </div>

      {data.surveyData?.status === "F" && (
        <div>
          <div className="font-medium mb-3">นัดสำรวจอีกครั้ง</div>
          <div className="flex flex-wrap">
            <div className="md:w-1/2 w-full md:mb-0 mb-3">
              <div className="px-3">
                <div className="mb-3 font-medium">ผู้ดำเนินการสำรวจ</div>
                <Selection
                  value={data.surveyData?.survey_by || ""}
                  options={workerOptions}
                  placeholder={"ผู้ดำเนินการสำรวจ"}
                  onUpdate={(value, item) => handleChangeWorker(value, item)}
                  onSearch={(s: string) => getWorkerListOptions(s)}
                />
              </div>
            </div>

            <div className="md:w-1/2 w-full">
              <div className="px-3">
                <InputDateButton
                  label="วันที่นัดสำรวจ"
                  value={data.surveyData?.appointment_date as Date}
                  onChange={(val) => handleChange("appointment_date", val)}
                  placeholder="เลือกวันที่เริ่มต้น"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </CardCollapse>
  );
};

export default SurveyResult;
