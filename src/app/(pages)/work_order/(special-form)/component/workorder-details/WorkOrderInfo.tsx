import React from "react";
import {Options, WorkOrderObj} from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import {renderStatusWorkOrder} from "@/app/(pages)/work_order/[id]/work-order-status";
import {JobPriorityOptions} from "@/app/api/WorkOrderApi";
import {formatJSDateTH} from "@/app/helpers/DatetimeHelper";

interface WorkOrderDetailProps {
  data: WorkOrderObj;
  status: string;
  mainWorkCenterOptions?: Options[]
}

const WorkOrderInfo: React.FC<WorkOrderDetailProps> = ({
                                                         data,
                                                         status,
                                                         mainWorkCenterOptions
}) => {
  // Check if essential data is missing
  // const isDataIncomplete = !data.request_no || !data.request_sap_no || !data.request_status;
  const isDataIncomplete = false

  const WorkOrderInform = ({title, value}: {
    title: string,
     value: string
  }) => (
    <div className="flex flex-wrap items-center justify-between mb-3">
      <div className="text-wrap text-[#4A4A4A]">{title} : </div>
      <div className="text-wrap text-[#160C26]">{value}</div>
    </div>
  )

  return (
    <Card className="bg-[#F4EEFF] shadow-[#A6AFC366] mb-3">
      <CardContent className="p-5">
        <div className="flex justify-center items-center text-center -mt-5 mb-6 w-full">
          <div className="bg-[#9538EA] font-medium text-[20px] py-2 rounded-bl-md rounded-br-md text-white w-full">
            {status}
          </div>
        </div>

        {isDataIncomplete ? (
          <div className="text-center py-10">
            <div className="text-[#ED3241]">ไม่มีรายละเอียดคำร้อง</div>
          </div>
        ) : (
          <div className="flex flex-wrap">
            <div className="w-full md:w-1/2 px-2 md:border-r-1 md:border-r-[#AAAAAA]">
              <WorkOrderInform title="เลขที่คำร้อง" value={data.customerRequestNo || "-"}/>
              <WorkOrderInform title="เลขที่คำร้องจาก SAP" value={data.sapOrderNo as string || "-"}/>

              <div className="flex flex-row justify-between mb-3">
                <label className="text-[#4A4A4A]">สถานะคำร้อง</label>
                <div>
                  <span className="bg-[#F9AC12] px-3 py-1 rounded-sm text-white text-sm font-medium">
                    {renderStatusWorkOrder(data.workOrderStatusCode)}
                    {/*{data.workOrderStatusName}*/}
                  </span>
                </div>
              </div>

              <WorkOrderInform title="ประเภทใบสั่งงาน" value={data.workOrderType ? data.workOrderType === "sub" ? "ใบสั่งงานย่อย" : "ใบสั่งงานหลัก" : "ใบสั่งงานหลัก"}/>
              <WorkOrderInform title="กอง/กฟฟ." value={data.peaNameFull || data.peaOffice || '-'}/>
              <WorkOrderInform title="คำอธิบายการทำงาน" value={data.workDescription || '-'}/>
            </div>

            <div className="w-full md:w-1/2 px-2">
              <div className="flex flex-row flex-wrap justify-between mb-3">
                <label className="text-[#4A4A4A] mb-2 md:mb-0">ลำดับความสำคัญของงาน</label>
                <div>
                  <span className="bg-[#E02424] px-3 py-1 rounded-md text-[14px] text-white">
                    {JobPriorityOptions.find((item) => item.value == data.priority)?.label || '-'}
                  </span>
                </div>
              </div>

              <WorkOrderInform title="ประเภทงานบริการ" value={data.serviceName || "-"}/>
              <WorkOrderInform title="ช่องทางรับคำร้อง" value={data.requestChannel || "-"}/>
              <WorkOrderInform title="วันที่รับคำร้อง" value={data.requestDate ? formatJSDateTH(new Date(data.requestDate), "dd MMMM yyyy") : "-"}/>
              <WorkOrderInform title="ศูนย์งาน/ศูนย์บริการ (Work Center)"
                               value={
                                 mainWorkCenterOptions && mainWorkCenterOptions.length > 0
                                   ? mainWorkCenterOptions.find((item) => item.value == data.mainWorkCenterId)?.label || '-'
                                   : data.mainWorkCenterName || data.mainWorkCenterId || '-'
                               }
              />
              <WorkOrderInform title="ศูนย์ต้นทุน" value={data.costCenter || "-"}/>
              <WorkOrderInform title="รหัสโรงงาน" value={data.officePlant || "-"}/>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkOrderInfo;
