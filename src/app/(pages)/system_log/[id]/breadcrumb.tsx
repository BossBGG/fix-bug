import Breadcrumb from "@/app/layout/Breadcrumb";

const SystemLogDetailBreadcrumb = ({id}: {id: string}) => {
  const items = [
    { label: 'System Log', href: '/system_log' },
    { label: 'รายละเอียด', href: `/system_log/${id}` },
  ]

  return <Breadcrumb items={items}
                     title={'รายละเอียด'}
                     goBackUrl={'/system_log'}
  />
}

export default SystemLogDetailBreadcrumb;
