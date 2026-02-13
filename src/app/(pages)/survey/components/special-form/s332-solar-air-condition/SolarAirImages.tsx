import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import SurveyImageForm from "@/app/(pages)/survey/components/special-form/SurveyImageForm";
import {S332SolarAirSurveyData, Survey, UploadedFile, WorkOrderSurveyData} from "@/types";
import {useState} from "react";

interface SolarAirImagesProps {
  data: Survey;
  updateData: (data: Survey) => void;
}

const SolarAirImages = ({
                          data,
                          updateData
                        }: SolarAirImagesProps) => {
  const [serviceSpecificData, setServiceSpecificData] = useState<S332SolarAirSurveyData>(
    data.surveyData?.serviceSpecificData as S332SolarAirSurveyData || {} as S332SolarAirSurveyData
  )

  const imagesCategory = [
    {key: 'house_front_media_id', name: 'ภาพหน้าบ้านลูกค้า', data_field: 'houseFrontMedia'},
    {key: 'roof_installation_media_id', name: 'ภาพหลังคาที่จะติดตั้งแผงโซลาร์', data_field: 'roofInstallationMedia'},
    {key: 'outdoor_unit_location_media_id', name: 'ภาพตำแหน่งติดตั้งคอยล์ร้อน', data_field: 'outdoorUnitLocationMedia'},
    {key: 'indoor_unit_location_media_id', name: 'ภาพตำแหน่งติดตั้งคอยล์เย็น', data_field: 'indoorUnitLocationMedia'},
    {key: 'ac_cabling_route_media_id', name: 'ภาพแนวการเดินสายไฟ AC', data_field: 'acCablingRouteMedia'},
    {key: 'dc_cabling_route_media_id', name: 'ภาพแนวการเดินสายไฟ DC', data_field: 'dcCablingRouteMedia'},
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
                             value={(serviceSpecificData?.[category.data_field as keyof S332SolarAirSurveyData] as UploadedFile)?.url || ""}
                             fileInfo={serviceSpecificData?.[category.data_field as keyof S332SolarAirSurveyData] as UploadedFile || null}
            />
          ))
        }
      </div>
    </CardCollapse>
  )
}

export default SolarAirImages
