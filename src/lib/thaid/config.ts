// ThaID Configuration Types
export interface ThaIDConfig {
  ISSUER: string;
  CLIENT_ID: string;
  REDIRECT_URL: string;
  SCOPE: string;
  RESPONSE_TYPE: string;
}

// ThaID Configuration
export function getTHAIDConfig(): ThaIDConfig {
  const env = typeof window !== 'undefined' ? (window as any).__ENV__ : undefined;

  return {
    ISSUER:
      env?.NEXT_PUBLIC_THAID_ISSUER ||
      process.env.NEXT_PUBLIC_THAID_ISSUER ||
      "https://imauth.bora.dopa.go.th",
    CLIENT_ID: env?.NEXT_PUBLIC_THAID_CLIENT_ID || process.env.NEXT_PUBLIC_THAID_CLIENT_ID || "",
    REDIRECT_URL:
      env?.NEXT_PUBLIC_THAID_REDIRECT_URL ||
      process.env.NEXT_PUBLIC_THAID_REDIRECT_URL ||
      "http://localhost:3000/callback",
    SCOPE: env?.NEXT_PUBLIC_THAID_SCOPE || process.env.NEXT_PUBLIC_THAID_SCOPE || "pid openid",
    RESPONSE_TYPE: "code",
  };
}

export default getTHAIDConfig;
