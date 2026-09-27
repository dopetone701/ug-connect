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
  themeColor: "#0a0a0a", // same as your --bg, not #000
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
      <body style={{ background: "hsl(var(--bg))", margin: 0, padding: 0 }}>
        <EngineProvider>
          <CoreEngine />
          <AppShell>{children}</AppShell>
        </EngineProvider>
        <PWAInstallPrompt />
        <script dangerouslySetInnerHTML={{ __html: `
          // kill pull to refresh + rubber band
          document.addEventListener('touchmove', function(e){
            const target = e.target;
            const isScroll = target.closest('.content-scroll, .faders-scroll, .search-drawer-scroll, .watch-drawer, .reels-sheet');
            if(!isScroll) e.preventDefault();
          }, { passive: false });
        `}} />
      </body>
    </html>
  );
}
