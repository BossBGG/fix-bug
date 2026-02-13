import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import SurveyImageForm from "@/app/(pages)/survey/components/special-form/SurveyImageForm";
import {S332SolarBatterySurveyData, Survey, UploadedFile} from "@/types";
import {useState} from "react";

interface SolarAirImagesProps {
  data: Survey;
  updateData: (data: Survey) => void;
}

const SolarAirImages = ({
                          data,
                          updateData
                        }: SolarAirImagesProps) => {
  const [serviceSpecificData, setServiceSpecificData] = useState<S332SolarBatterySurveyData>(
    data.surveyData?.serviceSpecificData as S332SolarBatterySurveyData || {} as S332SolarBatterySurveyData
  )

  const imagesCategory = [
    {key: 'house_front_media_id', name: 'ภาพหน้าบ้านลูกค้า', data_field: 'houseFrontMedia'},
    {key: 'meter_bill_media_id', name: 'ภาพมิเตอร์หรือบิลค่าไฟ', data_field: 'meterBillMedia'},
    {key: 'consumer_unit_media_id', name: 'ภาพตู้ Consumer Unit หรือ MDB', data_field: 'consumerUnitMedia'},
    {key: 'roof_area_media_id', name: 'ภาพหลังคาบ้าน', data_field: 'roofAreaMedia'},
    {key: 'inverter_location_media_id', name: 'ภาพจุดติดตั้ง Inventer', data_field: 'inverterLocationMedia'},
    {key: 'battery_location_media_id', name: 'ภาพจุดติดตั้ง Battery', data_field: 'batteryLocationMedia'},
  ]
  return (
    <CardCollapse title={"ภาพถ่าย"}>
      <div className="flex flex-wrap w-full">
        {
          imagesCategory.map((category) => (
            <SurveyImageForm data={data}
                             updateData={updateData}
                             field={category.key}
                             title={category.name}
                             value={(serviceSpecificData?.[category.data_field as keyof S332SolarBatterySurveyData] as UploadedFile)?.url || ""}
                             fileInfo={serviceSpecificData?.[category.data_field as keyof S332SolarBatterySurveyData] as UploadedFile || null}
            />
          ))
        }
      </div>
    </CardCollapse>
  )
}

export default SolarAirImages
