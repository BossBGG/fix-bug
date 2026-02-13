'use client'
import "../globals.css";
import StoreProvider from "@/app/redux/provider";
import Sidebar from "@/app/layout/Sidebar";
import Header from "@/app/layout/Header";
import '@fortawesome/fontawesome-svg-core/styles.css'
import {BreadcrumbProvider} from "@/app/context/BreadcrumbContext";
import {useEffect} from "react";
import {
  DESKTOP_SCREEN,
  MOBILE_SCREEN,
  setScreenSize,
  TABLET_SCREEN
} from "@/app/redux/slices/ScreenSizeSlice";
import {useAppDispatch, useAppSelector} from "@/app/redux/hook";
import HeaderMobile from "@/app/layout/HeaderMobile";
import { PushNotificationManager } from "@/components/notification/PushNotificationManager";

export default function RootLayout({
                                     children
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  const dispatch = useAppDispatch();
  const screenSize = useAppSelector(state => state.screen_size);
  const handleResize = () => {
    let screen_size: 'desktop' | 'mobile' | 'tablet' = DESKTOP_SCREEN
    const width = window.innerWidth;
    console.log('width >>> ', width);
    if (width <= 768) {
      screen_size = MOBILE_SCREEN;
    } else if (width <= 1376) {
      //1376 ipad pro horizontal
      screen_size = TABLET_SCREEN;
    }

    dispatch(setScreenSize(screen_size));
  };

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  })

  return (
    <StoreProvider>
      {
        screenSize === MOBILE_SCREEN && <HeaderMobile/>
      }
      <BreadcrumbProvider>
        <PushNotificationManager />
        <div className="min-h-screen bg-[#F4EEFF] flex relative">
          <Sidebar/>
          <main className="flex-1 bg-[#F4EEFF] p-[14px] w-full min-w-0">
            <div className="w-full h-full bg-white rounded-[40px] p-[20px]">
              <Header/>
              {children}
            </div>
          </main>
        </div>
      </BreadcrumbProvider>
    </StoreProvider>
  );
}
