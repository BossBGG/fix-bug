import EmptyEquipment from "@/assets/images/empty_equipment.png";

export const EmpTyData = (): React.ReactNode => {
  return <div className="flex flex-col justify-center items-center p-5">
    <img src={EmptyEquipment.src} alt="empty system log"/>
    <div className="font-bold text-[24px] mt-5 text-center">ไม่มีรายการกลุ่มวัสดุอุปกรณ์</div>
  </div>
}
