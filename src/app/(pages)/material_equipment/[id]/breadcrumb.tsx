import Breadcrumb from "@/app/layout/Breadcrumb";
import {useParams} from "next/navigation";

const AddMaterialEquipmentBreadcrumb = () => {
  const params = useParams();
  const titleCreateOrEdit: "สร้าง" | "แก้ไข" = params.id === 'create' ? 'สร้าง' : 'แก้ไข'
  const items = [
    {label: 'จัดการกลุ่มวัสดุและอุปกรณ์', href: '/material_equipment'},
    {label: `${titleCreateOrEdit}กลุ่ม`, href: '/material_equipment/create'},
  ]

  return <Breadcrumb items={items}
                     title={`${titleCreateOrEdit}กลุ่มวัสดุและอุปกรณ์`}
                     goBackUrl={"/material_equipment"}/>
}

export default AddMaterialEquipmentBreadcrumb;
