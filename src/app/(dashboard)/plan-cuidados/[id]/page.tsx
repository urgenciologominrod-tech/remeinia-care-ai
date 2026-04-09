export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// ============================================================
// REMEINIA Care AI — Plan Personalizado de Cuidados
// ============================================================
import { notFound } from 'next/navigation';
import PlanCuidadosViewer from '@/components/clinical/PlanCuidadosViewer';

interface Props {
  params: { id: string };
}

export default async function PlanCuidadosPage({ params }: Props) {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');
  const { prisma } = await import('@/lib/prisma');

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const valoracion = await prisma.valoracion.findFirst({
    where: {
      OR: [{ id: params.id }, { planCuidados: { id: params.id } }],
    },
    include: {
      planCuidados: true,
      usuario: { select: { nombre: true, apellidos: true, cedula: true, servicio: true } },
    },
  });

  if (!valoracion || !valoracion.planCuidados) {
    notFound();
  }

  return (
    <PlanCuidadosViewer
      valoracion={valoracion as any}
      plan={valoracion.planCuidados as any}
      usuario={valoracion.usuario as any}
      currentUserId={userId}
    />
  );
}
