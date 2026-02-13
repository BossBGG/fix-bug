declare global {
  interface Window {
    __ENV__?: {
      NEXT_PUBLIC_KEY_CLOAK_CLIENT_ID?: string;
      NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI?: string;
      NEXT_PUBLIC_APP_BASE_URL?: string;
      NEXT_PUBLIC_APP_VERSION?: string;
      NEXT_PUBLIC_SERVER_MODE?: string;
      NEXT_PUBLIC_WORK_D_DEV?: string;
      NEXT_PUBLIC_WORK_D_PROD?: string;
      NEXT_PUBLIC_APP_API_BASE_URL?: string;
      NEXT_PUBLIC_THAID_ISSUER?: string;
      NEXT_PUBLIC_THAID_CLIENT_ID?: string;
      NEXT_PUBLIC_THAID_REDIRECT_URL?: string;
      NEXT_PUBLIC_THAID_SCOPE?: string;
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?: string;
    };
  }
}

export {};
