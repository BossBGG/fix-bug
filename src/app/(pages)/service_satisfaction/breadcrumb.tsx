import Breadcrumb from "@/app/layout/Breadcrumb";

const ServiceSatisfactionBreadcrumb = ({
                               title
                             }: {
  title: string;
}) => {
  const items = [
    {label: 'ผลประเมินความพึงพอใจในการให้บริการ', href: '/service_satisfaction'}
  ]

  return <Breadcrumb items={items} title={title} goBackUrl={'/service_satisfaction'} />
}

export default ServiceSatisfactionBreadcrumb;
