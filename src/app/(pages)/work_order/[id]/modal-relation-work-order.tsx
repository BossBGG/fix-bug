import React from "react";
import Modal from "@/app/layout/Modal";
import {MainWorkOrderRelation, SubWorkOrderRelation, WorkOrderRelation} from "@/types";
import {format} from "date-fns";
import {getWorkOrderRelationships} from "@/app/api/WorkOrderApi";
import {th} from "date-fns/locale";
import {cn} from "@/lib/utils";

type ModalRelationWorkOrder = {
  open: boolean,
  onClose: () => void,
  id: string
}

export const ModalRelationWorkOrder: React.FC<ModalRelationWorkOrder> = ({
                                                                           open,
                                                                           onClose,
                                                                           id
                                                                         }) => {
  const [mainWorkOrder, setMainWorkOrder] = React.useState<MainWorkOrderRelation | null>(null);
  const [subWorkOrders, setSubWorkOrder] = React.useState<SubWorkOrderRelation[]>([]);

  React.useEffect(() => {
    if (open && id) {
      getWorkOrderRelationships(id)
        .then(response => {
          if (response.data) {
            setMainWorkOrder(response.data?.data?.mainWorkOrder || null)
            setSubWorkOrder(response.data?.data?.subWorkOrders || [])
          }
        })
        .catch(error => {
          console.error('Error fetching work order relationships:', error);
        });
    }
  }, [open, id]);

  const viewWorkOrder = (id: string) => {
    window.location.href = `/work_order/${id}`
  }

  return (
    <Modal title={"แสดงความสัมพันธ์ใบสั่งงาน"}
           open={open}
           onClose={onClose}>
      {
        mainWorkOrder ?
          <div>
            <div className={
              cn(
                'p-3 border-1 rounded-md cursor-pointer',
                id === mainWorkOrder?.id ? "bg-[#FBF8FF] border-[#D0BAE5]" : "border-[#E0E0E0]"
              )}
                 onClick={() => viewWorkOrder(mainWorkOrder.id)}
            >
              <div className="text-[24px] text-[#671FAB] font-bold">{mainWorkOrder?.workOrderNo || ""}</div>
              <div className="text-[12px] md:text-[16px] text-[#671FAB] mb-3">ใบสั่งงานหลัก</div>

              <RelationInfo label={"เลขที่คำร้อง"} value={mainWorkOrder?.customerRequestNo || "-"}/>
              <RelationInfo label={"ชื่อลูกค้า"} value={mainWorkOrder?.customerName || "-"}/>
              <RelationInfo label={"หน่วยงาน"} value={mainWorkOrder?.peaOffice || "-"}/>
              <RelationInfo label={"วันที่สร้างใบสั่งงาน"}
                            value={format(mainWorkOrder?.workOrderCreateDate || new Date(), "dd MMMM yyyy", {locale: th})}/>
              <RelationInfo label={"ประเภทใบสั่งงาน"} value={"ขอเช่าเครื่องกำเนิดไฟฟ้า"}/>
            </div>

            <div className="my-4">ใบสั่งงานย่อย ({subWorkOrders?.length || 0})</div>

            {
              subWorkOrders?.length > 0 ?
                subWorkOrders?.map((item: SubWorkOrderRelation, index: number) => {
                  return (
                    <div className={cn(
                      'relative pl-10 my-2 cursor-pointer',
                      id === item?.id ? "bg-[#FBF8FF] border-[#D0BAE5]" : "border-[#E0E0E0]"
                    )}
                         onClick={() => viewWorkOrder(item.id)}
                         key={item.id}>

                      <div
                        className="absolute left-[9px] w-8 -translate-y-1/2 rounded-bl-xl border-b-2 border-l-2 border-[#671FAB]"
                        style={{
                          height: index === 0 ? "8%" : "160%",
                          top: index === 0 ? "70%" : "-20%",
                        }}
                        aria-hidden="true"
                      />

                      <div className="border-1 rounded-md p-3"
                           style={{
                             backgroundColor: item.id === id ? "#F0E9F7" : "white",
                             borderColor: item.id === id ? "#D0BAE5" : "#E0E0E0"
                           }}
                      >
                        <div className="mb-3 text-[#671FAB] font-semi-bold">{item.workOrderNo || ""}</div>
                        <RelationInfo label={"หน่วยงาน"} value={item.peaOffice || ""}/>
                        <RelationInfo label={"วันที่สร้างใบสั่งงาน"}
                                      value={format(item?.workOrderCreateDate || new Date(), "dd MMMM yyyy", {locale: th})}/>
                        <RelationInfo label={"ประเภทใบสั่งงาน"} value={"ขอเช่าเครื่องกำเนิดไฟฟ้า"}/>
                      </div>
                    </div>
                  )
                })
                : ""
            }
          </div>
          : <div className="text-center text-gray-500 text-[20px] px-3 py-8">
            ไม่พบความสัมพันธ์ของใบสั่งงาน
          </div>
      }
    </Modal>
  )
}

type RelationInfo = {
  label: string,
  value: string
}

const RelationInfo: React.FC<RelationInfo> = ({
                                                label,
                                                value
                                              }) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between text-[14px] md:text-[16px] gap-2 w-full">
      <div className="text-[#4A4A4A] mt-1 whitespace-nowrap">{label} :</div>
      <div className="text-[#160C26] md:text-right">{value}</div>
    </div>
  )
}
