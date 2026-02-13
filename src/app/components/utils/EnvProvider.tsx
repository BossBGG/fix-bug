"use client";
import { useEnvContext } from "next-runtime-env";
import { useEffect } from "react";

/**
 * Environment Provider Component
 * Sets window.__ENV__ from next-runtime-env useEnvContext
 * Required for window.__ENV__ access in login component
 */
export default function EnvProvider() {
  const envContext = useEnvContext();

  useEffect(() => {
    if (typeof window !== "undefined" && envContext) {
      // Set window.__ENV__ from next-runtime-env context
      window.__ENV__ = envContext;

      // Log success for verification
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Environment variables set from next-runtime-env:", {
          CLIENT_ID: envContext.NEXT_PUBLIC_KEY_CLOAK_CLIENT_ID || "❌ Missing",
          REDIRECT_URI:
            envContext.NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI || "❌ Missing",
        });
      }
    }
  }, [envContext]);

  return null;
}
