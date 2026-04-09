// ============================================================
// REMEINIA Care AI — Plan Personalizado de Cuidados
// ============================================================
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PlanCuidadosViewer from '@/components/clinical/PlanCuidadosViewer';

interface Props { params: { id: string } }

export default async function PlanCuidadosPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  // Buscar por ID de valoración o de plan
  const valoracion = await prisma.valoracion.findFirst({
    where: {
      OR: [{ id: params.id }, { planCuidados: { id: params.id } }],
    },
    include: {
      planCuidados: true,
      usuario: { select: { nombre: true, apellidos: true, cedula: true, servicio: true } },
    },
  });

  if (!valoracion || !valoracion.planCuidados) notFound();

  return (
    <PlanCuidadosViewer
      valoracion={valoracion as any}
      plan={valoracion.planCuidados as any}
      usuario={valoracion.usuario as any}
      currentUserId={userId}
    />
  );
}
