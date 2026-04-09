export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authOptions } = await import('@/lib/auth');
  const { prisma } = await import('@/lib/prisma');

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await req.json();

  const plan = await prisma.planCuidados.update({
    where: { id: params.id },
    data: { notasEnfermero: body.notasEnfermero },
  });

  return NextResponse.json({ success: true, plan });
}