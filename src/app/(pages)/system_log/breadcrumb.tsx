import Breadcrumb from "@/app/layout/Breadcrumb";

const SystemLogBreadcrumb = () => {
  const items = [
    { label: 'System Log', href: '/system_log' },
  ]

  return <Breadcrumb items={items} title={'System Log'} />
}

export default SystemLogBreadcrumb;
