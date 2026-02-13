import {MenuItem} from "@/types";

export const pea_menu: MenuItem[] = [
  {
    name: 'เมนู',
    href: '',
    isTitle: true,
  },
  {
    // name: 'รายการใบสั่งงาน',
    name: 'รายการใบสั่งงานและผลปฏิบัติงาน',
    href: '/work_order',
    icon: 'icon-worksheet',
    key: 'work_order'
  },
  {
    name: 'ภาพรวม',
    href: '/dashboard',
    key: 'dashboard',
    icon: 'icon-home',
  },
  {
    name: 'ปฏิทิน',
    href: '/calendar',
    key: 'calendar',
    icon: 'icon-calendar_month',
  },
  {
    name: 'ประเมินความพึงพอใจในการให้บริการ',
    href: '/service_satisfaction',
    key: 'satisfaction',
    icon: 'icon-satisfaction',
  },
  {
    name: 'ประกาศและข่าว',
    href: '/news',
    key: 'news',
    icon: 'icon-news'
  },
  {
    name: 'ตั้งค่า',
    isTitle: true,
    href: ''
  },
  {
    name: 'จัดการกลุ่มวัสดุและอุปกรณ์',
    href: '/material_equipment',
    key: 'equipment',
    icon: 'icon-equipment',
  },
  {
    name: 'แจ้งเตือนทั้งหมด',
    href: '/notifications',
    key: 'notifications',
    icon: 'icon-notification',
  },
  {
    name: 'System Log',
    href: '/system_log',
    key: 'system_log',
    icon: 'icon-system_log'
  }
]
