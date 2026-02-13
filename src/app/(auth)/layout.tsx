import "../globals.css";
import StoreProvider from "@/app/redux/provider";

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      {children}
    </StoreProvider>
  );
}
