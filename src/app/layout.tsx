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
      <head />
      <body style={{ background: "hsl(var(--bg))", margin: 0, padding: 0 }}>
        {/* iOS PWA portrait respect - locks after first tap, no message */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  async function lockP(){
    try{
      if(window.screen && window.screen.orientation && window.screen.orientation.lock){
        await window.screen.orientation.lock('portrait');
      }
    }catch(e){}
  }
  window.addEventListener('load', lockP);
  window.addEventListener('click', lockP, {once: true});
  window.addEventListener('touchstart', lockP, {once: true});
  document.addEventListener('visibilitychange', function(){
    if(!document.hidden) lockP();
  });
})();
            `,
          }}
        />
        <EngineProvider>
          <CoreEngine />
          <AppShell>{children}</AppShell>
        </EngineProvider>
        <PWAInstallPrompt />
      </body>
    </html>
  );
}