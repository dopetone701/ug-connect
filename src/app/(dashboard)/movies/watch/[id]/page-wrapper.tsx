"use client";
import dynamic from 'next/dynamic';

const WatchPage = dynamic(() => import('./watch-client'), {
  ssr: false,
  loading: () => <div style={{ background: '#000000', height: '100dvh', width: '100vw', position: 'fixed', inset: 0 }} />,
});

export default function PageWrapper() {
  return <WatchPage isOverlay={false} />;
}
