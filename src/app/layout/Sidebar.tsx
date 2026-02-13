'use client'
import {pea_menu as peaMenuItems} from '@/app/config/pea_menu'
import {vendor_menu as vendorMenuItems} from '@/app/config/vendor_menu'
import Link from "next/link";
import Image from "next/image";
import WOMIcon from '@/assets/images/wom_icon.png'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons"
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {useCallback, useEffect} from "react";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {useAppDispatch, useAppSelector} from "@/app/redux/hook";
import {setExpandSidebar} from "@/app/redux/slices/SidebarSlice";
import {DESKTOP_SCREEN, MOBILE_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

const Sidebar = () => {
  const path: string = usePathname() as string;
  const dispatch = useAppDispatch();
  const sidebarExpanded = useAppSelector(state => state.sidebar_expand);
  const screenSize = useAppSelector(state => state.screen_size);
  const user = useAppSelector(state => state.user);
  const menuItems = user.type === 'VENDOR_USER' ? vendorMenuItems : peaMenuItems;

  const setSidebarExpand = useCallback((is_expand: boolean) => {
    dispatch(setExpandSidebar(is_expand))
  }, [dispatch])

  useEffect(() => {
    if (screenSize === DESKTOP_SCREEN) {
      setSidebarExpand(true);
    } else {
      setSidebarExpand(false);
    }
  }, [screenSize, setSidebarExpand])

  return (
    <aside className={
      cn('bg-[#F4EEFF] text-[#160C26] md:block',
        screenSize !== DESKTOP_SCREEN && 'h-[100vh]',
        sidebarExpanded
          ? 'absolute md:sticky md:top-0 md:h-screen z-1 w-60 md:w-60 overflow-y-auto'
          : `w-[86px] sticky top-0 h-screen ${screenSize === MOBILE_SCREEN ? 'hidden' : ''}`
      )}>
      <div className={
        cn('p-6 flex items-center justify-between cursor-pointer',
          screenSize === MOBILE_SCREEN && 'hidden'
        )}>
        <Image src={WOMIcon} alt="icon WOM" priority={true}/>

        <div className={
          cn('bg-[#E1D2FF] rounded-full px-[13.25px] py-[12px] items-center flex w-fit',
            sidebarExpanded ? undefined : 'absolute top-[5.5rem] left-[85%]')
        }
             onClick={() => {
               setSidebarExpand(!sidebarExpanded)
             }}>
          <FontAwesomeIcon icon={faBars as IconProp} size="lg" color="#671FAB"/>
        </div>
      </div>
      {/*mobile hidden*/}
      <nav className={
        cn('p-4 space-y-2 font-semibold md:block',
          !sidebarExpanded && screenSize === MOBILE_SCREEN && 'hidden'
        )}>
        {menuItems.map((item, index) => (
          item.isTitle ?
            <div key={index} className="my-5">
              <div className="flex items-center text-nowrap">
                {item.name}
                <hr className="ms-2 border-[#9538EA] w-full"></hr>
              </div>
            </div>
            : <Link key={index} href={item.href || ''}
                    onClick={() => screenSize !== DESKTOP_SCREEN && setTimeout(() => {
                      setSidebarExpand(false)
                    }, 500)}
                    className={
                      cn('flex items-center hover:bg-[#671FAB] hover:text-white rounded',
                        path.startsWith(item.href) ? 'text-white bg-[#671FAB]' : 'text-[#160C26]',
                        sidebarExpanded ? 'gap-3 my-2 py-2 px-4' : 'justify-center my-2 p-3')
                    }>
              {
                item.icon && <i
                  className={
                    cn(item.icon,
                      path.startsWith(item.href) ? 'text-white' : 'text-[#9538EA]',
                      sidebarExpanded ? 'text-[18px]' : 'text-[25px]'
                    )
                  }/>
              }

              {sidebarExpanded && item.name}
            </Link>
        ))}
      </nav>

      <div className={
        cn('absolute bottom-10 left-9 text-center text-[#4A4A4A] text-[14px] font-semibold',
          !sidebarExpanded ? 'hidden' : undefined
        )
      }>
        <div className="font-semibold">เวอร์ชัน {window.__ENV__?.NEXT_PUBLIC_APP_VERSION || ''}</div>
      </div>
    </aside>
  )
}

export default Sidebar;
