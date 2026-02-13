import {Options} from "@/types";

const workOrderStatus: Options[] = [
  {value: 'W', label: 'รอเปิดใบสั่งงาน'},
  {value: 'M', label: 'รอเริ่มปฏิบัติงาน'},
  {value: 'O', label: 'อยู่ระหว่างดำเนินงาน'},
  {value: 'V', label: 'รอผลการสำรวจ'},
  {value: 'K', label: 'รอจบงาน'},
  {value: 'B', label: 'รออนุมัติปิดงาน'},
  {value: 'J', label: 'ปิดงานไม่สำเร็จ'},
  {value: 'T', label: 'รอขึ้น SAP'},
  {value: 'X', label: 'ขึ้น SAP ไม่สมบูรณ์'},
  {value: 'Y', label: 'ขึ้น SAP สมบูรณ์'},
  {value: 'Z', label: 'ยกเลิกใบสั่งงาน'},
]

export const renderStatusWorkOrder = (status: string) => {
  if(status) {
    return workOrderStatus.find((workOrder) => workOrder.value == status)?.label || "รอเริ่มปฏิบัติงาน";
  }
  return "รอเริ่มปฏิบัติงาน";
}

export const getWorkOrderStatusOptions = (showAll: boolean = false) => {
  return [
    {label: "ทั้งหมด", value: ""},
    ...workOrderStatus
  ]
}
