import "@/styles/globals.css";
import AppShell from "@/components/layout/app-shell/app-shell";
import { EngineProvider } from "@/components/media/engine/engine-provider";
import { CoreEngine } from "@/components/media/engine/core-engine";
import type { Viewport, Metadata } from "next";
import PWAInstallPrompt from "@/components/pwa/install-prompt";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
  // REMOVED viewportFit cover - this was killing top bar
};

export const metadata: Metadata = {
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "UG Connect",
    statusBarStyle: "black",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: "#000" }}>
      <body
        className="bg-black"
        style={{
          background: "#000",
          margin: 0,
          padding: 0,
          overscrollBehavior: "none",
        }}
      >
        <EngineProvider>
          <CoreEngine />
          <AppShell>{children}</AppShell>
        </EngineProvider>
        <PWAInstallPrompt />
      </body>
    </html>
  );
}