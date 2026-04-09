import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json();
  const plan = await prisma.planCuidados.update({
    where: { id: params.id },
    data: { notasEnfermero: body.notasEnfermero },
  });

  return NextResponse.json({ success: true, plan });
}
