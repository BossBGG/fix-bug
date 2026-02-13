import Breadcrumb from "@/app/layout/Breadcrumb";

const NewsBreadcrumb = () => {
  const items = [
    { label: 'ประกาศและรายการข่าว', href: '/news' },
  ]

  return <Breadcrumb items={items} title={'ประกาศและรายการข่าว'} />
}

export default NewsBreadcrumb;
