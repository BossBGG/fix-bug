import React from "react";
import {WorkOrderObj} from "@/types";
import {Card} from "@/components/ui/card";
import {formatJSDateTH} from "@/app/helpers/DatetimeHelper";
import {cn} from "@/lib/utils";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFile, faPencil} from "@fortawesome/free-solid-svg-icons";
import {renderStatusWorkOrder} from "@/app/(pages)/work_order/[id]/work-order-status";
import {Checkbox} from "@/components/ui/checkbox";

interface ListDataContentProps {
  item: WorkOrderObj,
  selected: string[],
  onCheck: (checked: boolean, val: string) => void
}

interface DataInfoProps {
  title: string
  value: string
}

const DataInfo = ({
                    title,
                    value
                  }: DataInfoProps) => (
  <div className="mb-2 flex flex-wrap text-[14px]">
    <p className="text-[#4A4A4A] mr-1" style={{wordBreak: 'break-word'}}>{title} : </p>
    <p className="text-[#160C26] text-wrap" style={{wordBreak: 'break-word'}}> {value}</p>
  </div>
)

const getPathEditWorkOrder = (
  status: string,
  workOrder: WorkOrderObj,
  requestCode: string
) => {
  // มีแค่ status W,O,K
  let params = new URLSearchParams({
    id: workOrder.id as string,
    requestCode: requestCode as string,
  });

  switch (status) {
    case "W":
      params.append("isEdit", "true");
      return `/work_order/create_or_update?${params.toString()}`;
    default: //O,K
      params.append("isExecute", "true");
      return `/work_order/create_or_update?${params.toString()}`;
  }
};

const ListDataContent: React.FC<ListDataContentProps> = ({
                                                           item,
                                                           selected,
                                                           onCheck
                                                         }) => {
  const requestCode = item.requestCode?.toLowerCase();
  const status = item.statusCode;
  const editPath = getPathEditWorkOrder(status, item, requestCode);
  const isCanEdit = !["B", "J", "T", "X", "Y", "Z", "M"].includes(
    item.statusCode
  );

  const getBGColor = () => {
    switch (item.statusCode) {
      case "W":
      case "M":
        return "bg-[#F9AC12]";
      case "O":
      case "K":
        return "bg-[#03A9F4]"
      default:
        return "bg-[#9538EA]";
    }
  }

  return (
    <Card className="mb-3">
      <div className="p-4 flex flex-wrap items-center">
        <div className="w-[8%] md:w-[5%]">
          <Checkbox id="all"
                    className="border-[#9538EA] data-[state=checked]:border-none data-[state=checked]:bg-[#9538EA] w-[20px] h-[20px]"
                    checked={selected.includes(item.workOrderNo)}
                    disabled={item.statusCode !== 'K'}
                    onCheckedChange={(check: boolean) =>
                      onCheck(check, item.workOrderNo)
                    }
          />
        </div>
        <div className="w-[90%] md:w-[93%]">
          <div className="w-fit mb-3">
            <div className={
              cn(
                'font-medium text-[14px] p-2 rounded-md text-white',
                getBGColor()
              )
            }>
              {renderStatusWorkOrder(item.statusCode)}
            </div>
          </div>

          <div className="flex flex-wrap">
            <div className="py-0 px-2 md:border-r-1 w-full md:w-[40%]">
              <DataInfo title={"เลขที่คำร้อง"} value={item.customerRequestNo || "-"}/>
              <DataInfo title={"ประเภทคำร้อง"} value={item.serviceType || "-"}/>
            </div>

            <div className="py-0 px-2 md:border-r-1 w-full md:w-[30%]">
              <DataInfo title={"ชื่อลูกค้า"}
                        value={item.customerName || "-"}
              />
              <DataInfo title={"ประเภทใบสั่งงาน"}
                        value={item.workOrderType === "sub" ? "ใบสั่งงานย่อย" : "ใบสั่งงานหลัก"}/>
            </div>

            <div className="py-0 px-2 w-full md:w-[30%]">
              <DataInfo title={"รายละเอียด"} value={item.workDescription || "-"}/>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center px-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-[#4A4A4A]">ประเภท : </span>
              <div
                className={
                  cn(
                    `rounded-full text-center px-3 py-2 font-medium text-[12px]`,
                    item.workCategory && item.workCategory === 'survey'
                      ? "bg-[#FDE5B6] text-[#E67C00]"
                      : "bg-[#E1D2FF] text-[#6C4AB6]"
                  )
                }
              >
                {item.workCategory && item.workCategory === 'survey' ? "งานสำรวจ" : "งานปฏิบัติงาน"}
              </div>
            </div>

            <div>
              <Link
                className="bg-[#BEE2FF] rounded-sm px-3 py-1"
                href={`/work_order/${item.id}`}
              >
                <FontAwesomeIcon icon={faFile} color="#03A9F4" />
              </Link>
            </div>

            <div>
              {isCanEdit && (
                <Link
                  href={editPath}
                  className="bg-[#FDE5B6] rounded-sm px-2 py-1"
                >
                  <FontAwesomeIcon icon={faPencil} color="#F9AC12" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ListDataContent;
