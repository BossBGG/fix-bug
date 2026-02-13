"use client";
import Image from "next/image";
import WOMLogo from "@/assets/images/logo_wom.png";
import ThaiDLogo from "@/assets/images/thai_d_auth.png";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {useAppDispatch, useAppSelector} from "@/app/redux/hook";
import ThaIDLoginButton from "@/app/components/thaid/ThaIDLoginButton";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
import {dismissAlert, showError, showProgress, showSuccess} from "@/app/helpers/Alert";
import {LoginVendorApi} from "@/app/api/LoginApi";
import {setToken} from "@/app/redux/slices/AuthSlice";
import {setUserProfile} from "@/app/redux/slices/UserSlice";


type UserType = "PEA" | "VENDOR";

interface AuthTypeButtonProps {
  label: string;
  userTypeSelected: UserType;
  onClick: (value: UserType) => void;
  authType: UserType;
}

const AuthTypeButton: React.FC<AuthTypeButtonProps> = ({
  label,
  userTypeSelected,
  onClick,
  authType,
}: AuthTypeButtonProps) => {
  const defaultClass = "py-[8] px-[12] w-1/2 rounded-4xl cursor-pointer";
  const activeClass = "bg-[#E1D2FF] text-[#671FAB]";

  return (
    <button
      className={`${defaultClass} ${
        userTypeSelected === authType && activeClass
      }`}
      onClick={() => onClick(authType)}
    >
      {label}
    </button>
  );
};

const Login = () => {
  const [userType, setUserType] = useState<"PEA" | "VENDOR">("PEA");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const authenticate = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (authenticate) {
      router.push("/work_order");
    }
  }, []);

  const authenticKeycloak = () => {
    const KEYCLOAK_CLIENT_ID =
      window.__ENV__?.NEXT_PUBLIC_KEY_CLOAK_CLIENT_ID || "";
    const KEYCLOAK_REDIRECT_URI =
      window.__ENV__?.NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI || "";

    if (!KEYCLOAK_CLIENT_ID) {
      console.error("❌ KEYCLOAK_CLIENT_ID is empty!");
      alert(
        "Keycloak Client ID is not configured. Check environment variables."
      );
      return;
    }

    if (!KEYCLOAK_REDIRECT_URI) {
      console.error("❌ KEYCLOAK_REDIRECT_URI is empty!");
      alert(
        "Keycloak Redirect URI is not configured. Check environment variables."
      );
      return;
    }

    const params = new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID,
      redirect_uri: KEYCLOAK_REDIRECT_URI,
      response_type: "code",
      scope: "openid",
    });

    window.location.href =
      "https://sso2.pea.co.th/realms/pea-users/protocol/openid-connect/auth?" +
      params.toString();
  };

  const handleThaIDLoginStart = () => {
    setIsLoggingIn(true);
  };

  const handleThaIDLoginError = (error: Error) => {
    setIsLoggingIn(false);
    console.error("ThaID Login error:", error);
    alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ ThaID: " + error.message);
  };

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    setUsername("");
    if(passwordRef && passwordRef.current) {
      passwordRef.current.value = "";
    }
    setShowPassword(false);
  };

  const handleVendorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const password = passwordRef.current?.value || "";
    if (!username || !password) {
      showError("กรุณากรอก Username และ Password");
      return;
    }

    setIsLoggingIn(true);
    showProgress()
    try {
      await LoginVendorApi(username, password)
        .then(res => {
          if(res.data?.status_code === 200 && res.data?.data) {
            dispatch(setToken(res.data.data.api_token));
            dispatch(setUserProfile(res.data.data.user));
            router.push("/work_order");
            showSuccess("เข้าสู่ระบบสำเร็จ");
          } else {
            console.error("Login response error:", res.data);
            dismissAlert()
            showError(
              "เข้าสู่ระบบไม่สำเร็จ: " +
              (res.data?.message || "Unknown error")
            );
          }
      })

    } catch (error) {
      console.error("Vendor login error:", error);
      dismissAlert()
      showError("เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-wrap h-screen">
      <div className="w-full xl:w-1/2 h-[45%] xl:h-full">
        <Image
          src={WOMLogo}
          alt="WOM logo login"
          className="w-full h-full xl:p-3 object-cover rounded-bl-[100px] rounded-br-[100px] xl:rounded-0"
          priority={true}
        />
      </div>

      {/*<div className="w-full md:w-1/2 h-[390px] md:h-full bg-center bg-no-repeat bg-cover rounded-4xl"
           style={{backgroundImage: `url(${WOMLogo.src})`}}>
      </div>*/}

      <div className="w-full xl:w-1/2 h-1/2 xl:h-full flex flex-col items-center justify-center">
        <div className="w-4.8/5 md:w-4.5/5 xl:w-3/5 text-center">
          <div className="font-bold text-[24px]">
            ระบบ Work Order Management
          </div>

          <div className="bg-[#F8F8F8] text-[#4A4A4A] rounded-4xl my-6 p-1 font-semibold w-full">
            <AuthTypeButton
              label="พนักงาน กฟภ."
              userTypeSelected={userType}
              onClick={handleUserTypeChange}
              authType="PEA"
            />
            <AuthTypeButton
              label="พนักงานรับจ้าง"
              userTypeSelected={userType}
              onClick={handleUserTypeChange}
              authType="VENDOR"
            />
          </div>

          {userType === "PEA" ? (
            <>
              <button
                className="pea-button font-bold mt-9 w-[100%] !py-[12] cursor-pointer"
                onClick={() => authenticKeycloak()}
              >
                เข้าสู่ระบบด้วย Keycloak
              </button>
            </>
          ) : (
            <>
              {/* Vendor Login Form */}
              <form onSubmit={handleVendorLogin} className="mt-9">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#671FAB] focus:border-transparent"
                    disabled={isLoggingIn}
                  />
                </div>

                <div className="mb-6 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    ref={passwordRef}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#671FAB] focus:border-transparent"
                    disabled={isLoggingIn}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    disabled={isLoggingIn}
                  >
                    {showPassword ? (
                      <FontAwesomeIcon icon={faEyeSlash}/>
                    ) : (
                      <FontAwesomeIcon icon={faEye}/>
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  className="pea-button font-bold w-full !py-[12] cursor-pointer"
                  disabled={isLoggingIn}
                  style={{
                    opacity: isLoggingIn ? 0.6 : 1,
                    cursor: isLoggingIn ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoggingIn ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </button>
              </form>
            </>
          )}

          <div className="text-[#45058E] my-12">Or continue with</div>

          {/* ThaID Login Button */}
          <div className="flex justify-center">
            <ThaIDLoginButton
              onLoginStart={handleThaIDLoginStart}
              onError={handleThaIDLoginError}
              className="flex items-center justify-center w-[75px] h-[75px] rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              style={{
                border: "2px solid #671FAB",
                opacity: isLoggingIn ? 0.6 : 1,
                cursor: isLoggingIn ? "not-allowed" : "pointer",
              }}
            >
              {isLoggingIn ? (
                <div className="w-8 h-8 border-2 border-[#671FAB] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Image
                  src={ThaiDLogo}
                  alt="thai d logo for authenticate"
                  className="w-[65px] h-[65px]"
                />
              )}
            </ThaIDLoginButton>
          </div>

          {/* Loading State Text */}
          {isLoggingIn && (
            <div className="text-center mt-3 text-[#671FAB] text-sm">
              กำลังเชื่อมต่อกับ ThaID...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
