import Breadcrumb from "@/app/layout/Breadcrumb";

const WorkOrderBreadcrumb = ({
                               path,
                               title
                             }: {
  path: string;
  title: string;
}) => {
  const items = [
    {label: 'ใบสั่งงาน', href: ''},
    {label: 'รายการใบสั่งงาน', href: '/work_order'},
    {label: 'ใบสั่งงาน', href: `/work_order/${path}`},
  ]

  return <Breadcrumb items={items} title={title} goBackUrl={'/work_order'} />
}

export default WorkOrderBreadcrumb;
