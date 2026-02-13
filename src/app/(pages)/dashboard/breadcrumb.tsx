import Breadcrumb from "@/app/layout/Breadcrumb";

const DashboardBreadcrumb = () => {
  const items = [
    { label: 'เมนู', href: '/dashboard' },
    { label: 'ภาพรวม', href: '/dashboard' },
  ]

  return <Breadcrumb items={items} title={'ภาพรวม'} />
}

export default DashboardBreadcrumb;
