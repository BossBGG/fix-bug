import Breadcrumb from "@/app/layout/Breadcrumb";

const ServiceSatisfactionDetailBreadcrumb = ({
                               title
                             }: {
  title: string;
}) => {
  const items = [
    {label: 'ประเมินความพึงพอใจในการให้บริการ', href: '/service_satisfaction'},
    {label: 'รายละเอียดการประเมินความพึงพอใจ', href: ''},
  ]

  return <Breadcrumb items={items} title={title} goBackUrl={'/service_satisfaction'} />
}

export default ServiceSatisfactionDetailBreadcrumb;
