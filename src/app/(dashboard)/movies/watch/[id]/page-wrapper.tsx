"use client";
import dynamic from 'next/dynamic';

const WatchPage = dynamic(() => import('./watch-client'), {
  ssr: false,
  loading: () => <div style={{ background: '#0f1f16', height: '100dvh' }} />,
});

export default function PageWrapper() {
  return <WatchPage isOverlay={false} />;
}
