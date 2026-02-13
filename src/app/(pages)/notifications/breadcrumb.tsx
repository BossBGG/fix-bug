import Breadcrumb from "@/app/layout/Breadcrumb";

const NotificationBreadcrumb = () => {
    const items = [
        { label: 'Notification', href: '/notifications' },
    ]
    return <Breadcrumb items={items} title="Notification"/>
}

export default NotificationBreadcrumb;