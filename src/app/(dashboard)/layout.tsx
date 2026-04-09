export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar rol={(session.user as any).rol} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar user={session.user as any} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}