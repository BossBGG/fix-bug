import type { NextConfig } from "next";
import createNextPWA from "@ducanh2912/next-pwa";

const withPWA = createNextPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: false, // Let the app handle SW registration
  scope: "/",
  sw: "pwa-sw.js",
  /*fallbacks: {
    document: "/offline",
  },*/
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    skipWaiting: true,
    // importScripts: ["/sw-push.js"],
    ignoreURLParametersMatching: [/.*/],
    additionalManifestEntries: [
      { url: "/manifest.json", revision: null },
      { url: "/icon-wom-192x192.png", revision: null },
      { url: "/icon-wom-512x512.png", revision: null },
      { url: "/offline", revision: null },
      { url: "/work_order/create_or_update", revision: null },
    ],
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
          networkTimeoutSeconds: 5, // รอเน็ตแค่ 5 วิ ถ้าไม่ได้ไปเอา cache
          matchOptions: {
            ignoreSearch: true, // <--- สำคัญ: บอก Cache.match ว่าไม่ต้องสน ?id=...
          },
          plugins: [
            {
              handlerDidError: async ({ request }) => {
                // พยายามหาใน Cache อีกครั้งแบบไม่สน Query String
                const cachedResponse = await caches.match(request, {
                  ignoreSearch: true,
                });

                if (cachedResponse) {
                  return cachedResponse;
                }

                // ถ้าหาไม่เจอจริงๆ ค่อยไปหน้า Offline
                return caches.match("/offline") || Response.error();
              },
            },
          ],
        },
      },
      {
        urlPattern: new RegExp(`^${process.env.NEXT_PUBLIC_APP_API_BASE_URL}`),
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
          networkTimeoutSeconds: 10,
        },
        method: "GET",
      },
      {
        urlPattern: new RegExp(`^${process.env.NEXT_PUBLIC_APP_API_BASE_URL}`),
        handler: "NetworkOnly",
        options: {
          backgroundSync: {
            name: "offline-post-queue",
            options: {
              maxRetentionTime: 24 * 60, // Retry for max 24 hours
            },
          },
        },
        method: "POST",
      },
      {
        urlPattern: new RegExp(`^${process.env.NEXT_PUBLIC_APP_API_BASE_URL}`),
        handler: "NetworkOnly",
        options: {
          backgroundSync: {
            name: "offline-put-queue",
            options: {
              maxRetentionTime: 24 * 60, // Retry for max 24 hours
            },
          },
        },
        method: "PUT",
      },
    ],
  },
});

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  // เพิ่มการตั้งค่า allowedDevOrigins
  swcMinify: false,
  experimental: {
    allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000"],
  } as Record<string, unknown>,

  // Ensure public files are accessible
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },
      {
        source: "/pwa-sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/firebase-messaging-sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },

  async rewrites() {
    const staticFileRewrites = [
      { source: "/manifest.json", destination: "/static/manifest.json" },
      { source: "/pwa-sw.js", destination: "/static/pwa-sw.js" },
      { source: "/sw-push.js", destination: "/static/sw-push.js" },
      {
        source: "/firebase-messaging-sw.js",
        destination: "/static/firebase-messaging-sw.js",
      },
      { source: "/env-config.js", destination: "/static/env-config.js" },
      {
        source: "/workbox-:hash.js",
        destination: "/static/workbox-:hash.js",
      },
      {
        source: "/fallback-:hash.js",
        destination: "/static/fallback-:hash.js",
      },
      {
        source: "/icon-wom-192x192.png",
        destination: "/static/icon-wom-192x192.png",
      },
      {
        source: "/icon-wom-512x512.png",
        destination: "/static/icon-wom-512x512.png",
      },
    ];

    if (!process.env.NEXT_PUBLIC_APP_BASE_URL) {
      return { beforeFiles: staticFileRewrites, afterFiles: [] };
    }

    return {
      beforeFiles: staticFileRewrites,
      afterFiles: [
        {
          source: "/api/:path*",
          destination: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/v1/:path*`, // for deployment
          // destination: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/:path*`, // for local development
        },
      ],
    };
  },

  // Add env for next-runtime-env
  env: {
    NEXT_PUBLIC_KEY_CLOAK_CLIENT_ID:
      process.env.NEXT_PUBLIC_KEY_CLOAK_CLIENT_ID,
    NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI:
      process.env.NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI,
    NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
    NEXT_PUBLIC_APP_API_BASE_URL: process.env.NEXT_PUBLIC_APP_API_BASE_URL,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_SERVER_MODE: process.env.NEXT_PUBLIC_SERVER_MODE,
    NEXT_PUBLIC_WORK_D_DEV: process.env.NEXT_PUBLIC_WORK_D_DEV,
    NEXT_PUBLIC_WORK_D_PROD: process.env.NEXT_PUBLIC_WORK_D_PROD,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  },
};

export default withPWA(nextConfig);
