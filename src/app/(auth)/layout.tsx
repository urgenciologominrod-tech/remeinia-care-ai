export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');

  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}