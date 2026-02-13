import React, {useCallback} from "react";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import InputText from "@/app/components/form/InputText";
import {Options, Survey, WorkOrderObj} from "@/types";
import debounce from "lodash/debounce";
import {Selection} from "@/app/components/form/Selection";
import handleSearchMainWorkCenter from "@/app/helpers/SearchMainWorkCenter";

type SurveyMeterInfoProps = {
  data: Survey,
  updateData: (data: Survey) => void,
  mainWorkCenterOptions: Options[],
  onUpdateOptions: (opts: Options[]) => void
}

const SurveyMeterInfo: React.FC<SurveyMeterInfoProps> = ({
                                                           data,
                                                           updateData,
                                                           mainWorkCenterOptions,
                                                           onUpdateOptions
                                                         }) => {
  const [meterSurvey, setMeterSurvey] = React.useState<Survey>(data);

  const handleChange = async (key: keyof Survey, value: string | number) => {
    let newData = {...data, [key]: value};
    setMeterSurvey(newData);
    await debounceSetData(newData)
  }

  const debounceSetData = useCallback(
    debounce(async (d: Survey) => {
      updateData(d)
    }, 1000), []
  )

  return (
    <CardCollapse title={"ข้อมูลจากการสำรวจ"}>
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/2 p-2">
          <InputText value={meterSurvey.routeCode}
                     label={"สายการอ่านหน่วย"}
                     placeholder={"สายการอ่านหน่วย"}
                     onChange={(v) => handleChange('routeCode', v)}
          />
        </div>

        <div className="w-full md:w-1/2 p-2">
          <InputText value={meterSurvey.customerNumber}
                     label={"หมายเลขผู้ใช้ไฟฟ้า"}
                     placeholder={"หมายเลขผู้ใช้ไฟฟ้า"}
                     onChange={(v) => handleChange('customerNumber', v)}
          />
        </div>

        <div className="w-full md:w-1/3 p-2">
          <InputText value={meterSurvey.meterSerialNumber}
                     label={"มิเตอร์ที่ติดตั้ง"}
                     placeholder={"มิเตอร์ที่ติดตั้ง"}
                     onChange={(v) => handleChange('meterSerialNumber', v)}
          />
        </div>

        <div className="w-full md:w-1/3 p-2">
          <InputText value={meterSurvey.recommendedPhase}
                     label={"เฟสแนะนำ"}
                     placeholder={"เฟสแนะนำ"}
                     onChange={(v) => handleChange('recommendedPhase', v)}
          />
        </div>

        <div className="w-full md:w-1/3 p-2">
          <div className="mb-3">ศูนย์งาน</div>
          <Selection options={mainWorkCenterOptions}
                     value={meterSurvey.mainWorkCenterId}
                     placeholder="ศูนย์งาน"
                     onSearch={(s: string) => handleSearchMainWorkCenter(s)}
                     onUpdateOptions={onUpdateOptions}
                     onUpdate={(v) => handleChange('mainWorkCenterId', v)}
          />
        </div>
      </div>
    </CardCollapse>
  )
}

export default SurveyMeterInfo
