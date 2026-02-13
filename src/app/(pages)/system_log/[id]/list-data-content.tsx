import {cn} from "@/lib/utils";
import {SystemLogObj} from "@/types";
import {MOBILE_SCREEN, TABLET_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";
import {formatJSDateTH} from "@/app/helpers/DatetimeHelper";

const BadgeData = ({label, variant="new"}: { label: string, variant: "new" | "old" }) => {
  const variantClasses = {
    old: 'text-[#8561FF] bg-[#F4EEFF]',
    new: 'bg-[#FFE2E5] text-[#ED3241]'
  }

  return (
    <div className={cn(variantClasses[variant], "text-[12px] px-2 py-1 rounded-full")}>
      {label}
    </div>
  )
}

const ListDataContent = ({item, screenSize}: { item: SystemLogObj, screenSize: string }) => {
  const isMobileOrTablet = screenSize === MOBILE_SCREEN || screenSize === TABLET_SCREEN;
  
  return (
    <div className="border-1 flex flex-wrap border-[#E0E0E0] rounded-[12px] p-2 mb-3 text-[14px]">
            {/*{
        screenSize === 'mobile' ?
          <div className="w-full flex p-2 justify-between items-center">
            <div className="text-[#4A4A4A]">วันที่ :</div>
            <div>{formatJSDateTH(new Date(), 'dd/mm/yyyy HH:mm น.')}</div>
          </div>
          :
          <div className="w-full md:w-2/6 lg:w-1/5 p-2 md:border-r-2 md:border-r-[#F4EEFF]">
            <div className="flex mb-2">
              <div className="text-[#4A4A4A]">วันที่ :</div>
              <div className="ml-1">{formatJSDateTH(new Date(), 'dd/mm/yyyy')}</div>
            </div>
            <div className="flex">
              <div className="text-[#4A4A4A]">เวลา :</div>
              <div className="ml-1">{formatJSDateTH(new Date(), 'HH:mm น.')}</div>
            </div>
          </div>
      }*/}
      <div className={`w-full ${isMobileOrTablet ? 'p-2' : 'md:w-2/6 lg:w-1/5 p-2 md:border-r-2 md:border-r-[#F4EEFF]'}`}>
        <div className="text-[#4A4A4A] mb-1">ชื่อฟิลด์ :</div>
        <div className={isMobileOrTablet ? 'text-sm' : ''}>{item.attributeName}</div>
      </div>

      <div className={`w-full ${isMobileOrTablet ? 'p-2' : 'md:w-2/6 lg:w-2/5 p-2 md:border-r-2 md:border-r-[#F4EEFF]'}`}>
        <div className="flex items-center mb-1">
          <div className="text-[#4A4A4A] mb-1 mr-2">รายละเอียดเพิ่มเติม</div>
          <BadgeData label="ข้อมูลเดิม" variant="old"/>
        </div>
        <div className={isMobileOrTablet ? 'text-sm break-words' : ''}>{item.fromValue || '-'}</div>
      </div>

      {
        isMobileOrTablet && <hr className="w-full border-1 border-[#F4EEFF] my-2"/>
      }
      <div className={`w-full ${isMobileOrTablet ? 'p-2' : 'md:w-2/6 lg:w-2/5 p-2'}`}>
        <div className="flex items-center mb-1">
          <div className="text-[#4A4A4A] mb-1 mr-2">รายละเอียดเพิ่มเติม</div>
          <BadgeData label="ข้อมูลใหม่" variant="new"/>
        </div>
        <div className={isMobileOrTablet ? 'text-sm break-words' : ''}>{item.toValue || '-'}</div>
      </div>
    </div>
  )
}

export default ListDataContent;
