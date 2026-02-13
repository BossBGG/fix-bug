import EmptySystemLog from "@/assets/images/empty_system_log.png";
import Image from "next/image"

export const EmpTyData = (): React.ReactNode => {
  return <div className="flex flex-col justify-center items-center p-4">
    <Image src={EmptySystemLog} alt="empty system log"/>

    <div className="font-bold text-[24px] mt-5">ไม่พบรายการประวัติการใช้งาน</div>
  </div>
}
