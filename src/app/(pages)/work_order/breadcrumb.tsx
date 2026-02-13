import Breadcrumb from "@/app/layout/Breadcrumb";

const WorkOrderBreadcrumb = () => {
  const items = [
    { label: 'ใบสั่งงาน', href: '' },
    { label: 'รายการใบสั่งงาน', href: '/work_order' },
  ]

  return <Breadcrumb items={items} title={'รายการใบสั่งงาน'} />
}

export default WorkOrderBreadcrumb;
