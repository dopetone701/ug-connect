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
   statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: "hsl(var(--bg))" }}>
      <head>
        {/* TITLE MATRIX FONTS — same list as title-fonts.ts, no import so build can't break */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Bebas+Neue&family=Oswald:wght@600;700&family=Anton&family=Playfair+Display:wght@800;900&family=Archivo+Black&family=Montserrat:wght@800;900&family=Inter:wght@800;900&display=swap"
          rel="stylesheet"
        />
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