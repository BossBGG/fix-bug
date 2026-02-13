import WOMIcon from "@/assets/images/wom_icon.png";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {useAppDispatch, useAppSelector} from "@/app/redux/hook";
import {setExpandSidebar} from "@/app/redux/slices/SidebarSlice";

const HeaderMobile = () => {
  const sidebarExpanded = useAppSelector(state => state.sidebar_expand);
  const dispatch = useAppDispatch();

  return (
    <header className="px-6 py-4 relative md:hidden">
      <div className="flex items-center">
        <Image src={WOMIcon} alt="icon WOM" priority={true}/>
        <div className={cn('bg-[#E1D2FF] rounded-full ml-2 px-3 py-3 items-center flex')}
             onClick={() => dispatch(setExpandSidebar(!sidebarExpanded))}>
          <FontAwesomeIcon icon={faBars as IconProp} size="lg" color="#671FAB"/>
        </div>
      </div>
    </header>
  )
}

export default HeaderMobile
