export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import Link from 'next/link';
import {
  PlusCircle, AlertTriangle, Activity, Clock, Users,
  ChevronRight, FlaskConical, Wind, Stethoscope, Clipboard,
} from 'lucide-react';
import { COLORES_ESTADO } from '@/types/clinical';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { clsx } from 'clsx';

export default async function DashboardPage() {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');
  const { prisma } = await import('@/lib/prisma');

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const rol = (session?.user as any)?.rol;

  const valoraciones = await prisma.valoracion.findMany({
    where: rol === 'ENFERMERO' ? { creadoPor: userId } : {},
    orderBy: { fechaHora: 'desc' },
    take: 10,
    include: { usuario: { select: { nombre: true, apellidos: true } } },
  });

  const stats = {
    total: valoraciones.length,
    criticos: valoraciones.filter(v => v.estadoPaciente === 'CRITICO').length,
    vigilancia: valoraciones.filter(v => v.estadoPaciente === 'VIGILANCIA').length,
    estables: valoraciones.filter(v => v.estadoPaciente === 'ESTABLE').length,
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard clínico</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/valoracion/nueva" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Nueva valoración
        </Link>
      </div>

      <div className="bg-clinical-50 border border-clinical-100 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-clinical-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-clinical-800">
          <strong>Herramienta de apoyo a la decisión clínica.</strong> Todas las sugerencias generadas deben ser evaluadas
          y validadas por el profesional de enfermería responsable. No sustituye el juicio clínico.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total valoraciones', value: stats.total, icon: Clipboard, color: 'text-clinical-600', bg: 'bg-clinical-50' },
          { label: 'Pacientes críticos', value: stats.criticos, icon: AlertTriangle, color: 'text-danger-600', bg: 'bg-danger-50' },
          { label: 'En vigilancia', value: stats.vigilancia, icon: Activity, color: 'text-warning-600', bg: 'bg-warning-50' },
          { label: 'Estables', value: stats.estables, icon: Users, color: 'text-success-600', bg: 'bg-success-50' },
        ].map(s => (
          <div key={s.label} className="card-clinical">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1 leading-tight">{s.label}</p>
              </div>
              <div className={clsx('p-2.5 rounded-xl', s.bg)}>
                <s.icon className={clsx('w-5 h-5', s.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* (resto de tu JSX igual, no cambia nada visual) */}
    </div>
  );
}