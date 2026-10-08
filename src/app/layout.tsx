


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
  viewportFit: "cover",
  themeColor: "#0f1f16",
};


export const metadata: Metadata = {
  manifest: "/manifest.json",
  icons: { icon: "/icon.png", apple: "/icon.png" },
  appleWebApp: {
    capable: true,
    title: "UG Connect",
    statusBarStyle: "default",
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: "hsl(var(--bg))" }}>
      <head>
        {/* HARD LOCK orientation via CSS */}
        <style dangerouslySetInnerHTML={{__html: `
          @media (orientation: landscape) and (max-height: 600px) {
            html { transform: none !important; }
          }
        `}} />
      </head>
      <body style={{ background: "hsl(var(--bg))", margin: 0, padding: 0 }}>
        <EngineProvider>
          <CoreEngine />
          <AppShell>{children}</AppShell>
        </EngineProvider>
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
