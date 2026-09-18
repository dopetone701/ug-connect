export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import WatchClient from './watch-client';

export default function Page() {
  return <WatchClient />;
}
