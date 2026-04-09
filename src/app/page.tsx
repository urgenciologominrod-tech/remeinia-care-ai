export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { redirect } from 'next/navigation';

export default async function RootPage() {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');

  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  redirect('/login');
}