import Image from "next/image";
import EmptyNotificationDesktop from "@/assets/images/notification_no_alerts.png";
import EmptyNotificationMobile from "@/assets/images/notification_no_alerts_mobile.png";
import { useAppSelector } from "@/app/redux/hook";
import {MOBILE_SCREEN} from "@/app/redux/slices/ScreenSizeSlice";

export const EmptyData = (): React.ReactNode => {
  const screenSize = useAppSelector(state => state.screen_size);

  return (
    <div className="flex flex-col justify-center items-center p-8">
      <Image
        src={screenSize === MOBILE_SCREEN ? EmptyNotificationMobile : EmptyNotificationDesktop}
        alt="ไม่มีรายการแจ้งเตือน"
        className="mb-4 lg:w-[159px] lg:h-[160px] md:w-[159px] md:h-[160px]"
      />
      <div className="font-bold text-[20px] md:text-[24px] text-[#160C26]">
        ไม่มีรายการแจ้งเตือน
      </div>
    </div>
  );
};
export default EmptyData
