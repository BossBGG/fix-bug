const WORK_ORDER_STATUS_MAP: Record<string, string> = {
  V: 'รอผลการสำรวจ',
  W: 'รอเปิดใบสั่งงาน',
  M: 'รอเริ่มปฏิบัติงาน',
  O: 'รอกำลังปฏิบัติงาน',
  K: 'รอจบงาน',
  B: 'รออนุมัติปิดงาน',
  J: 'ปิดงานไม่สำเร็จ',
  T: 'รอขึ้น SAP',
  X: 'ขึ้น SAP ไม่สมบูรณ์',
  Y: 'ขึ้น SAP สมบูรณ์',
  Z: 'ยกเลิกใบสั่งงาน',
}

export const getWorkOrderStatusLabel = (statusCode: string): string => {
  return WORK_ORDER_STATUS_MAP[statusCode] || statusCode;
}
