export async function generateStaticParams() {
  return [{ id: '1' }];
}

import PageWrapper from './page-wrapper';

export default function Page() {
  return <PageWrapper />;
}
