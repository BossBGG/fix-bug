import Breadcrumb from "@/app/layout/Breadcrumb";

const ProfileBreadcrumb = () => {
  const items = [
    { label: 'Profile', href: '/profile' },
  ]

  return <Breadcrumb items={items} title={'Profile'} />
}

export default ProfileBreadcrumb;
