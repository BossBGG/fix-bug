'use client'
import {useEffect} from "react";
import {LoginApi} from "@/app/api/LoginApi";
import {setToken} from "@/app/redux/slices/AuthSlice";
import {setUserProfile} from "@/app/redux/slices/UserSlice";
import {setPeaOfficeOption, setServiceTypeOption} from "@/app/redux/slices/OptionSlice";
import {showError, showProgress, showSuccess} from "@/app/helpers/Alert";
import {useAppDispatch} from "@/app/redux/hook";
import {useRouter} from "next/navigation";
import {getPeaOfficeOptions, getServiceTypeOptions} from "@/app/api/WorkOrderOptions";
import {Options} from "@/types";

const AuthenTicSuccess = () => {
  const dispatch = useAppDispatch();
  const router = useRouter()
  useEffect(() => {
    showProgress()
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      LoginApi(code)
        .then((res) => {
          if (res.data?.status_code === 200 && res.data.data) {
            dispatch(setToken(res.data.data.api_token));
            dispatch(setUserProfile(res.data.data.user));
            Promise.all([
              fetchServiceTypeOptions(),
              fetchPeaOfficeOptions()
            ]).then(([resServiceType, resOrgPeaOffice]) => {
              dispatch(setServiceTypeOption(resServiceType || []))
              dispatch(setPeaOfficeOption(resOrgPeaOffice || []))
            })
            router.push("/work_order");
            showSuccess("เข้าสู่ระบบสำเร็จ");
          } else {
            console.error("Login response error:", res.data);
            showError(
              "เข้าสู่ระบบไม่สำเร็จ: " +
              (res.data?.message || "Unknown error")
            );
          }
        })
        .catch((error) => {
          console.error("Login API error:", error);
          showError("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
        });
    } else {
      showError("เข้าสู่ระบบไม่สำเร็จ");
    }
  }, []);

  const fetchServiceTypeOptions = async () => {
    const resp = await getServiceTypeOptions();
    if (resp.status === 200 && resp.data.data && resp.data.data.serviceGroups) {
      let options: Options[] = []
      resp.data.data.serviceGroups.map((item) => {
        let sub_options = item.services?.map((sub, index) => {
          return {value: sub.requestCode, label: `${sub.requestCode} ${sub.name}`, data: sub}
        })

        let option: Options = {
          value: item.id,
          label: item.name,
          subOptions: sub_options
        }

        options.push(option)
      })

      return options
    }
    return []
  }

  const fetchPeaOfficeOptions = async () => {
    const resp = await getPeaOfficeOptions();
    if (resp.status === 200 && resp.data.data) {
      let org_data = resp.data.data.data;
      let options: Options[] = []
      org_data.map((item) => {
        let sub_options = item.children?.map((sub, index) => {
          let childrens: Options[] = []
          sub.children?.map((child) => {
            childrens.push({
              value: child.id,
              label: sub.office ? `${sub.name} [${sub.office}]` : sub.name,
              data: child
            })
          })
          return {
            value: sub.id,
            label: `${sub.regiongroup} : ${sub.name} ${sub.office ? `[${sub.office}]` : ''}`,
            data: sub,
            subOptions: childrens
          }
        })

        let option: Options = {
          value: item.id,
          label: item.name,
          subOptions: sub_options
        }

        options.push(option)
      })

      return options
    }
    return []
  }

  return (
    <div className="flex items-center justify-center w-full h-full absolute">
      <h1 className="font-bold">เข้าสู่ระบบสำเร็จ</h1>
    </div>
  )
}


export default AuthenTicSuccess;
