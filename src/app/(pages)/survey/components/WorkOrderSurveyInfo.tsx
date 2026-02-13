import InputText from "@/app/components/form/InputText";
import { Survey } from "@/types";
import CardCollapse from "@/app/(pages)/work_order/(special-form)/component/CardCollapse";
import { useAppSelector } from "@/app/redux/hook";
import { useEffect, useState } from "react";
import { formatJSDateTH } from "@/app/helpers/DatetimeHelper";
import { getWorkOrderStatusLabel } from "@/app/helpers/map-work-order-status";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
interface WorkOrderSurveyInfoProps {
  data: Survey;
  updateData: (d: Survey) => void;
}

const WorkOrderSurveyInfo = ({
  data,
  updateData,
}: WorkOrderSurveyInfoProps) => {
  const screenSize = useAppSelector((state) => state.screen_size);
  const [info, setInfo] = useState<Survey>({} as Survey);

  useEffect(() => {
    setInfo(data);
  }, [data]);

  const handleUpdateData = (key: keyof Survey, value: string | number) => {
    let newData = {
      ...data,
      [key]: value,
    };

    updateData(newData);
  };

  return (
    <CardCollapse
      title={"รายละเอียดคำร้อง"}
      isShowHeader={screenSize !== "desktop"}
    >
      <div className="flex flex-wrap items-center">
        <div className="w-full md:w-1/3 p-2">
          <CustomTooltip 
            fieldValue={info.customerRequestNo as string}
            fieldLabel="เลขที่คำร้อง"
          >
            <InputText
              placeholder="เลขที่คำร้อง"
              label="เลขที่คำร้อง"
              value={info.customerRequestNo as string}
              numberOnly={true}
              disabled={true}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/3 p-2">
          <CustomTooltip 
            fieldValue={info.sapOrderNo}
            fieldLabel="เลขที่คำร้อง (SAP)"
          >
            <InputText
              placeholder="เลขที่คำร้อง (SAP)"
              label="เลขที่คำร้อง (SAP)"
              value={info.sapOrderNo}
              numberOnly={true}
              disabled={true}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/3 p-2">
          <CustomTooltip 
            fieldValue={getWorkOrderStatusLabel(info.workOrderStatusCode)}
            fieldLabel="สถานะคำร้อง"
          >
            <InputText
              placeholder="สถานะคำร้อง"
              value={getWorkOrderStatusLabel(info.workOrderStatusCode)}
              label="สถานะคำร้อง"
              disabled={true}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/3 p-2">
          <CustomTooltip 
            fieldValue={info.serviceName}
            fieldLabel="ประเภทคำร้อง"
          >
            <InputText
              placeholder="ประเภทคำร้อง"
              label="ประเภทคำร้อง"
              value={info.serviceName}
              disabled={true}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/3 p-2">
          <CustomTooltip 
            fieldValue={info.requestChannel}
            fieldLabel="ช่องทางรับคำร้อง"
          >
            <InputText
              placeholder="ช่องทางรับคำร้อง"
              label="ช่องทางรับคำร้อง"
              value={info.requestChannel}
              disabled={true}
            />
          </CustomTooltip>
        </div>

        <div className="w-full md:w-1/3 p-2">
          <CustomTooltip 
            fieldValue={
              info.sapProcessCreatedDate
                ? formatJSDateTH(
                    new Date(info.sapProcessCreatedDate),
                    "dd MMMM yyyy"
                  )
                : ""
            }
            fieldLabel="วันที่รับชำระเงิน"
          >
            <InputText
              placeholder="วันที่รับชำระเงิน"
              label="วันที่รับชำระเงิน"
              value={
                info.sapProcessCreatedDate
                  ? formatJSDateTH(
                      new Date(info.sapProcessCreatedDate),
                      "dd MMMM yyyy"
                    )
                  : ""
              }
              disabled={true}
            />
          </CustomTooltip>
        </div>
      </div>
    </CardCollapse>
  );
};

export default WorkOrderSurveyInfo;
