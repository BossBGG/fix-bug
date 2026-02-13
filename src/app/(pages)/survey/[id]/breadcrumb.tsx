import Breadcrumb from "@/app/layout/Breadcrumb";

const WorkSurveyBreadcrumb = ({
                                title
                              }: {
  title: string;
}) => {
  const items = [
    {label: 'ใบสั่งงาน', href: ''},
    {label: 'รายการใบสั่งงาน', href: '/work_order'},
    {label: 'ใบสั่งงาน', href: `/work_order`},
  ]

  return <Breadcrumb items={items} title={title} goBackUrl={'/work_order'}/>
}

export default WorkSurveyBreadcrumb;
