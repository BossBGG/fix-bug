"use client";
import { useBreadcrumb } from "@/app/context/BreadcrumbContext";
import {
  faBell,
  faListUl,
  faUser,
  faRepeat,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faSortDown } from "@fortawesome/free-solid-svg-icons";
import ProfilePea from "@/assets/images/pea_profile.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/redux/hook";
import { User } from "@/types";
import { LogoutApi } from "@/app/api/LoginApi";
import { clearToken } from "@/app/redux/slices/AuthSlice";
import { clearUserProfile } from "@/app/redux/slices/UserSlice";
import {
  dismissAlert,
  showError,
  showProgress,
  showSuccess,
} from "@/app/helpers/Alert";
import Image from "next/image";
import WorkDIcon from "@/assets/images/work_d_icon.png";
import Link from "next/link";
import { useState } from "react";
import ModalPeaOrganize from "@/app/layout/ModalPeaOrganize";
import {
  setPeaOfficeOption,
  setServiceTypeOption,
} from "@/app/redux/slices/OptionSlice";
import NotificationHeader from "./NotificationHeader";

const Header = () => {
  const { breadcrumb } = useBreadcrumb();
  const router = useRouter();
  const defaultClassMenuItem = "px-2 py-3 cursor-pointer mb-2";
  const user: User = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [isOpenChangeOrg, setIsOpenChangeOrg] = useState<boolean>(false);

  const handleMenu = (menu: string) => {
    router.push(menu);
  };

  const handleChangeOrg = () => {
    setIsOpenChangeOrg(true);
  };

  const logout = () => {
    showProgress();
    LogoutApi().then((res) => {
      if (res.status === 201 && res.data) {
        const userType = user.type || "WOM_USER";
        dispatch(clearToken());
        dispatch(clearUserProfile());
        dispatch(setPeaOfficeOption([]));
        dispatch(setServiceTypeOption([]));
        if (res.data.logoutUrl && userType !== "VENDOR_USER") {
          window.location.href = res.data.logoutUrl;
          showSuccess("ออกจากระบบสำเร็จ");
        } else {
          window.location.href = "/login";
          showSuccess("ออกจากระบบสำเร็จ");
        }
      } else {
        showError("ออกจากระบบไม่สำเร็จ");
        dismissAlert();
      }
    });
  };

  return (
    <header className="pb-[12px]">
      <div className="p-2 flex items-center justify-between w-full flex-wrap">
        <div className="w-full md:w-1/2">{breadcrumb}</div>

        <div className="flex items-center justify-end w-1/2 md:relative absolute md:top-0 md:right-0 -top-[4rem] right-[1.5rem]">
          <div className=" px-4 py-3 rounded-full relative mr-3 cursor-pointer">
            <NotificationHeader />
          </div>

          <div className="hidden md:flex flex-col items-end justify-center mr-3">
            <div className="text-[#160C26] font-semibold mb-1">
              {user?.prefix ? `${user.prefix} ` : ""}
              {user?.firstName} {user?.lastName}
            </div>
            <div className="flex items-center">
              <div className="mr-2">
                <FontAwesomeIcon
                  icon={faUser}
                  size="sm"
                  color="#160C26"
                  className="font-semibold"
                />
              </div>
              <div className="text-[#160C26] mr-2 font-semibold">
                {user.username}
              </div>
              <div className="bg-[#9538EA] text-white rounded-[8] px-2 py-1">
                {user.selectedPeaOffice}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center cursor-pointer">
                <div className="w-[48] h-[48] border-2 border-[#E0E0E0] rounded-full overflow-hidden">
                  <img
                    src={user.profileImageUrl || ProfilePea.src}
                    alt="image profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="ms-2">
                  <FontAwesomeIcon icon={faSortDown} />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="p-3 w-60"
              sideOffset={18}
              alignOffset={-155}
              align="start"
            >
              {/*<DropdownMenuItem
                className={defaultClassMenuItem}
                onClick={() => handleMenu("/")}
              >
                <FontAwesomeIcon icon={faListUl} /> งานของฉัน
              </DropdownMenuItem>*/}
              <DropdownMenuItem
                className={defaultClassMenuItem}
                onClick={() => handleMenu("/profile")}
              >
                <FontAwesomeIcon icon={faUser} /> โปรไฟล์
              </DropdownMenuItem>
              {user.type !== "VENDOR_USER" && (
                <DropdownMenuItem
                  className={defaultClassMenuItem}
                  onClick={() => handleChangeOrg()}
                >
                  <FontAwesomeIcon icon={faRepeat} /> เปลี่ยนการไฟฟ้า
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className={defaultClassMenuItem}>
                <Link
                  href={
                    window.__ENV__?.NEXT_PUBLIC_SERVER_MODE === "development"
                      ? (window.__ENV__?.NEXT_PUBLIC_WORK_D_DEV as string)
                      : (window.__ENV__?.NEXT_PUBLIC_WORK_D_PROD as string)
                  }
                  className="flex items-center"
                >
                  <Image src={WorkDIcon} alt={"work d icon"} className="me-2" />{" "}
                  กลับเข้าสู่ระบบ Work D
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(
                  defaultClassMenuItem,
                  "border-1 border-[#671FAB] rounded-full",
                  "flex justify-center"
                )}
                onClick={() => logout()}
              >
                <div className="text-[#671FAB] hover:text-[#671FAB] text-center">
                  ออกจากระบบ
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <hr className="h-[4px] border-[#D0BAE5]" />

      <ModalPeaOrganize
        open={isOpenChangeOrg}
        onClose={() => setIsOpenChangeOrg(false)}
      />
    </header>
  );
};

export default Header;
