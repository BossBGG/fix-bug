import React from "react";
import { createAuthorizationUrl } from "@/lib/thaid/auth";

/**
 * ThaID Login Button Props
 */
interface ThaIDLoginButtonProps {
  className?: string;
  children?: React.ReactNode;
  onLoginStart?: () => void;
  onError?: (error: Error) => void;
  style?: React.CSSProperties;
}

/**
 * ThaID Login Button Component for PEA-WOM Project
 * Simplified version for OAuth2 authorization code flow
 */
export default function ThaIDLoginButton({
  className = "",
  children,
  onLoginStart,
  onError,
  style = {},
}: ThaIDLoginButtonProps) {
  const handleLogin = async (): Promise<void> => {
    try {
      console.log("Starting ThaID login process...");

      // Callback for parent component
      if (onLoginStart) {
        onLoginStart();
      }

      // Create authorization URL (now async)
      const authData = await createAuthorizationUrl();

      console.log("Redirecting to ThaID login page...");

      // Redirect to ThaID
      window.location.href = authData.url;
    } catch (error) {
      console.error("Login initialization failed:", error);

      const errorObj =
        error instanceof Error ? error : new Error(String(error));

      if (onError) {
        onError(errorObj);
      } else {
        alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ: " + errorObj.message);
      }
    }
  };

  // Default children if not provided
  const defaultChildren = (
    <div className="flex justify-center items-center">
      {/* ThaID Icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="mr-2"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
      เข้าสู่ระบบด้วย ThaID
    </div>
  );

  return (
    <button
      onClick={handleLogin}
      className={className}
      style={{
        cursor: "pointer",
        transition: "all 0.2s ease",
        ...style,
      }}
    >
      {children || defaultChildren}
    </button>
  );
}
