'use client'
import MaintenanceImg from "@/assets/images/maintenance_mode.png"
import TemplateMaintenance from "@/app/components/template/TemplateMaintenance";
// import {useAppDispatch, useAppSelector} from "@/app/redux/hook";
// import {useEffect} from "react";
// import {setToken} from "@/app/redux/slices/AuthSlice";

const MaintenanceMode = () => {
  /*const dispatch = useAppDispatch();
  const selector = useAppSelector((state) => state.auth);
  useEffect(() => {
    dispatch(setToken('aosdjfaklsdfjacnvaodijadfad'));
    console.log('token >>>> ', selector)
  });*/
  return (
    <TemplateMaintenance srcImg={MaintenanceImg}
                         titleEn="Service Unavailable"
                         titleTH="“ระบบปิดปรับปรุง”"
                         showBackBtn={false}
    />
  )
}

export default MaintenanceMode;
