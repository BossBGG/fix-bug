import {formatJSDateTH} from "@/app/helpers/DatetimeHelper";
import WOMLogo from "@/assets/images/logo_wom.png";
import Badge from "@/app/components/list/Badge";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import * as React from "react";
import {useRouter} from "next/navigation";
import {capitalizeFirstLetter} from "@/app/components/utils/stringUtils";
import {SystemLogObj, systemLogType} from "@/types";
import Image from "next/image"
import {MOBILE_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

const LogDetail = ({label, value}: { label: string, value: string }) => {
  return <div className="flex justify-between md:justify-start items-center mb-1">
    <div className="text-[#4A4A4A] mr-1 text-nowrap">{label} :</div>
    <div className="ml-1">{value}</div>
  </div>

}

const ListDataContent = ({item, screenSize}: { item: SystemLogObj, screenSize: string }) => {
  const router = useRouter();

  return (
    <div className="border-1 border-[#E0E0E0] rounded-[12px] p-3 mb-3 text-[14px]" key={item.uuid}>
      <div className="flex flex-wrap items-start w-full">
        <div className="pb-0 lg:p-2 w-full md:w-1/2 lg:w-1/4 lg:border-r-2 lg:border-r-[#F4EEFF]">
          <LogDetail label="วันที่"
                     value={formatJSDateTH(new Date(item.createdAt),
                       screenSize === MOBILE_SCREEN ? 'dd/MM/yyyy HH:mm น.' : 'dd/MM/yyyy') || '-'}
          />
          {
            screenSize !== MOBILE_SCREEN &&
            <LogDetail label="เวลา" value={formatJSDateTH(new Date(item.createdAt), 'HH:mm น.') || '-'}/>
          }
        </div>
        <div className="pb-0 lg:p-2 w-full md:w-1/2 lg:w-1/4 lg:border-r-2 lg:border-r-[#F4EEFF]">
          <div className="flex justify-between md:justify-start items-center mb-1">
            <div className="text-[#4A4A4A] mr-1 text-nowrap md:hidden">ผู้ใช้งาน :</div>
            <div className="flex items-center">
              <div className="w-[15px] h-[15px] overflow-hidden rounded-full border-1">
                <Image src={WOMLogo} alt="user profile picture" className="w-full h-full object-cover"/>
              </div>
              <div className="ml-2">{item.userFirstName} {item.userLastName}</div>
            </div>
          </div>
          <LogDetail label="IP Address" value={item.ipAddress}/>
        </div>
        <div className="px-0 lg:p-2 w-full lg:w-2/4">
          <LogDetail label="รายละเอียด" value={item.detail}/>
        </div>
      </div>
      <div className="px-0 lg:px-2">
        <div className="text-[#4A4A4A] mr-1 flex justify-between md:justify-start items-center">
          <div className="flex items-center">
            <div className="mr-1">ประเภท :</div>
            <Badge variant={item.logType?.toLowerCase() as systemLogType}
                   label={capitalizeFirstLetter(item.logType)}
                   className="!rounded-full"
            />
          </div>

          <div className="bg-[#BEE2FF] ml-2 rounded-[8px] p-2 flex items-center justify-center cursor-pointer"
               onClick={() => router.push(`/system_log/${item.uuid}`)}
          >
            <FontAwesomeIcon icon={faSearch} color="#03A9F4"/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListDataContent;
