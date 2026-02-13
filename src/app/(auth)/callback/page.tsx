"use client";
import { useEffect } from "react";
import { setToken } from "@/app/redux/slices/AuthSlice";
import { setUserProfile } from "@/app/redux/slices/UserSlice";
import {
  setPeaOfficeOption,
  setServiceTypeOption,
} from "@/app/redux/slices/OptionSlice";
import { showError, showProgress, showSuccess } from "@/app/helpers/Alert";
import { useAppDispatch } from "@/app/redux/hook";
import { useRouter } from "next/navigation";
import {
  getPeaOfficeOptions,
  getServiceTypeOptions,
} from "@/app/api/WorkOrderOptions";
import { Options } from "@/types";
import { LoginThaIDApi } from "@/app/api/LoginApi";
import { validateCallbackState, cleanupThaIDSession } from "@/lib/thaid/auth";

/**
 * ThaID Authentication Success Page
 * Unified callback page for ThaID OAuth2 flow
 * Processes authorization code and exchanges for access token via backend API
 */
const ThaIDAuthenticSuccess = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    showProgress();

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const state = params.get("state");

    // Handle OAuth error response
    if (error) {
      console.error("ThaID OAuth error:", error);
      cleanupThaIDSession(); // Clean up session on OAuth error
      showError("การเข้าสู่ระบบ ThaID ไม่สำเร็จ: " + error);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      return;
    }

    // Process authorization code
    if (code) {
      console.log("Processing ThaID authorization code...");

      // Validate OAuth2 state parameter for security
      const stateValidation = validateCallbackState(state);

      if (!stateValidation.isValid) {
        console.error(
          "OAuth2 security validation failed:",
          stateValidation.error
        );
        showError(
          "การตรวจสอบความปลอดภัย ThaID ไม่สำเร็จ: " + stateValidation.error
        );
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        return;
      }

      console.log("OAuth2 security validation passed");

      // Call backend API to exchange code for token (with nonce for validation)
      LoginThaIDApi(code, stateValidation.storedNonce)
        .then((res) => {
          if (res.data?.status_code === 200 && res.data.data) {
            console.log("ThaID login successful");

            // Set auth token and user profile in Redux
            dispatch(setToken(res.data.data.api_token));
            dispatch(setUserProfile(res.data.data.user));

            // Load required options
            Promise.all([
              fetchServiceTypeOptions(),
              fetchPeaOfficeOptions(),
            ]).then(([resServiceType, resOrgPeaOffice]) => {
              dispatch(setServiceTypeOption(resServiceType || []));
              dispatch(setPeaOfficeOption(resOrgPeaOffice || []));
            });

            // Clean up nonce after successful login
            sessionStorage.removeItem("thaid_nonce");
            
            // Redirect to work order page
            router.push("/work_order");
            showSuccess("เข้าสู่ระบบด้วย ThaID สำเร็จ");
          } else {
            console.error("ThaID login response error:", res.data);
            cleanupThaIDSession();
            showError(
              "เข้าสู่ระบบไม่สำเร็จ: " + (res.data?.message || "Unknown error")
            );
            setTimeout(() => {
              router.push("/login");
            }, 3000);
          }
        })
        .catch((error) => {
          console.error("ThaID Login API error:", error);
          cleanupThaIDSession(); // Clean up session on API error
          showError("เกิดข้อผิดพลาดในการเชื่อมต่อ ThaID API");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        });
    } else {
      console.error("Missing authorization code from ThaID");
      cleanupThaIDSession(); // Clean up session when no code
      showError("ไม่พบรหัสยืนยันตัวตนจาก ThaID");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  }, [dispatch, router]);

  const fetchServiceTypeOptions = async () => {
    const resp = await getServiceTypeOptions();
    if (resp.status === 200 && resp.data.data && resp.data.data.serviceGroups) {
      let options: Options[] = [];
      resp.data.data.serviceGroups.map((item) => {
        let sub_options = item.services?.map((sub, index) => {
          return {
            value: sub.requestCode,
            label: `${sub.requestCode} ${sub.name}`,
            data: sub,
          };
        });

        let option: Options = {
          value: item.id,
          label: item.name,
          subOptions: sub_options,
        };

        options.push(option);
      });

      return options;
    }
    return [];
  };

  const fetchPeaOfficeOptions = async () => {
    const resp = await getPeaOfficeOptions();
    if (resp.status === 200 && resp.data.data) {
      let org_data = resp.data.data.data;
      let options: Options[] = [];
      org_data.map((item) => {
        let sub_options = item.children?.map((sub, index) => {
          let childrens: Options[] = [];
          sub.children?.map((child) => {
            childrens.push({
              value: child.id,
              label: sub.office ? `${sub.name} [${sub.office}]` : sub.name,
              data: child,
            });
          });
          return {
            value: sub.id,
            label: `${sub.regiongroup} : ${sub.name} ${
              sub.office ? `[${sub.office}]` : ""
            }`,
            data: sub,
            subOptions: childrens,
          };
        });

        let option: Options = {
          value: item.id,
          label: item.name,
          subOptions: sub_options,
        };

        options.push(option);
      });

      return options;
    }
    return [];
  };

  return (
    <div className="flex items-center justify-center w-full h-full absolute bg-[#F4EEFF]">
      <div className="text-center bg-white p-8 rounded-[40px] shadow-lg">
        <div className="w-10 h-10 border-4 border-[#E1D2FF] border-t-[#671FAB] rounded-full animate-spin mx-auto mb-4" />
        <h1 className="font-bold text-[#671FAB] mb-2">
          กำลังประมวลผลข้อมูล ThaID...
        </h1>
        <p className="text-[#4A4A4A] text-sm">โปรดรอสักครู่</p>
      </div>
    </div>
  );
};

export default ThaIDAuthenticSuccess;
