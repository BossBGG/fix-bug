import Breadcrumb from "@/app/layout/Breadcrumb";

const CalendarBreadcrumb = () => {
  const items = [
    { label: 'ปฏิทิน', href: '/calendar' },
  ]

  return <Breadcrumb items={items} title={'ปฏิทิน'} />
}

export default CalendarBreadcrumb;
