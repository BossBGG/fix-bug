import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientWrapper from "@/app/components/utils/ClientWrapper";
import EnvProvider from "@/app/components/utils/EnvProvider";
import StoreProvider from "@/app/redux/provider";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/assets/fonts/icomoon/styles/style.css";
import { PublicEnvProvider } from "next-runtime-env";
import { DevAuthToggle } from "@/components/dev/DevAuthToggle";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { NetworkStatusIndicator } from "@/components/offline/NetworkStatusIndicator";

config.autoAddCss = false;

const IBM_PLEX_FONT = localFont({
  src: [
    {
      path: "../assets/fonts/IBMPlexSansThai-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/IBMPlexSansThai-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/IBMPlexSansThai-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/IBMPlexSansThai-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "PEA-WOM",
  description: "Work Order Management",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-wom-192x192.png",
    apple: "/icon-wom-192x192.png",
  },
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head title="PEA-WOM" />
      <body
        className={`${IBM_PLEX_FONT.className} antialiased`}
      >
        <PublicEnvProvider>
          <StoreProvider>
            <EnvProvider />
            <ServiceWorkerRegister />
            <NetworkStatusIndicator />
            <ClientWrapper />
            {children}
            <DevAuthToggle />
          </StoreProvider>
        </PublicEnvProvider>
      </body>
    </html>
  );
}
