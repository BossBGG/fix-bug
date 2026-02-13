import {MaterialEquipmentObj, systemLogType} from "@/types";
import Badge from "@/app/components/list/Badge";
import {Switch} from "@/components/ui/switch";
import {deleteData, handleActive} from "@/app/(pages)/material_equipment/columns";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencil, faTrashCan} from "@fortawesome/free-solid-svg-icons";

const ListDataContent = ({
                           item,
                           handleRefresh
                         }: {
  item: MaterialEquipmentObj,
  handleRefresh: () => void
}) => {
  const status = item.isActive ? 'active' : 'inactive'
  const status_label = status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'

  return (
    <div className="border-1 border-[#E0E0E0] rounded-[12px] mb-3 p-3 text-[14px]">
      <div className="flex justify-between mb-3">
        <Badge label={status_label} variant={status as systemLogType}/>
        <div className="flex items-center">
          <span className="text-[#4A4A4A] mr-1 hidden md:block">เปิด/ปิดการใช้งาน : </span>
          <Switch checked={item.isActive}
                  onCheckedChange={() => handleActive(item.uuid, !item.isActive, undefined, handleRefresh, item.name)}
                  className="data-[state=checked]:bg-[#9538EA] data-[state=unchecked]:bg-[#57595B]"
          />
        </div>
      </div>

      <div className="md:flex md:justify-between">
        <div className="mb-2 md:mb-0">
          <span className="text-[#4A4A4A]">รายละเอียด :
            <span className="text-[#160C26]">{item.name}</span>
          </span>
        </div>

        <div className="flex items-center justify-end ">
          <Link className="bg-[#FDE5B6] rounded-[8px] cursor-pointer mr-2 p-2 flex items-center justify-center"
                href={`/material_equipment/${item.uuid}`}
          >
            <FontAwesomeIcon icon={faPencil} size={"sm"} color="#F9AC12"/>
          </Link>
          <button className="bg-[#FFD4D4] rounded-[8px] cursor-pointer p-2 flex items-center justify-center"
                  onClick={() => deleteData(item.uuid as string, undefined, handleRefresh, item.name)}>
            <FontAwesomeIcon icon={faTrashCan} size={"sm"} color="#E02424"/>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ListDataContent;
