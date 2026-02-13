import Breadcrumb from "@/app/layout/Breadcrumb";

const MaterialEquipmentBreadcrumb = () => {
  const items = [
    { label: 'จัดการกลุ่มวัสดุและอุปกรณ์', href: '/material_equipment' },
  ]

  return <Breadcrumb items={items} title={'จัดการกลุ่มวัสดุและอุปกรณ์'} />
}

export default MaterialEquipmentBreadcrumb;
