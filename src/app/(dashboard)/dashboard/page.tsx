export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import Link from 'next/link';
import {
  PlusCircle, AlertTriangle, Activity, Users,
  Clipboard, FileText,
} from 'lucide-react';
import { clsx } from 'clsx';

const DEMO_METRICS = {
  valoracionesAcademicas: 3,
  planesGenerados: 3,
  casosCriticos: 1,
  pendientesValidacion: 3,
};

function isDemoSession(user: any) {
  const id = user?.id;
  const email = user?.email;

  return (
    id === 'demo-admin' ||
    id === 'demo-nurse' ||
    email === 'admin@remeinia.org' ||
    email === 'enfermera.demo@remeinia.org'
  );
}

export default async function DashboardPage() {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');
  const { prisma } = await import('@/lib/prisma');

  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const userId = user?.id;
  const rol = user?.rol;
  const demoMode = isDemoSession(user);

  let useAcademicFallback = demoMode;
  let stats = {
    total: 0,
    criticos: 0,
    vigilancia: 0,
    estables: 0,
  };

  if (!demoMode) {
    try {
      const valoraciones = await prisma.valoracion.findMany({
        where: rol === 'ENFERMERO' ? { creadoPor: userId } : {},
        orderBy: { fechaHora: 'desc' },
        take: 10,
        include: { usuario: { select: { nombre: true, apellidos: true } } },
      });

      stats = {
        total: valoraciones.length,
        criticos: valoraciones.filter(v => v.estadoPaciente === 'CRITICO').length,
        vigilancia: valoraciones.filter(v => v.estadoPaciente === 'VIGILANCIA').length,
        estables: valoraciones.filter(v => v.estadoPaciente === 'ESTABLE').length,
      };
    } catch {
      useAcademicFallback = true;
    }
  }

  const cards = useAcademicFallback
    ? [
        { label: 'Valoraciones académicas', value: DEMO_METRICS.valoracionesAcademicas, icon: Clipboard, color: 'text-clinical-600', bg: 'bg-clinical-50' },
        { label: 'Planes generados', value: DEMO_METRICS.planesGenerados, icon: FileText, color: 'text-success-600', bg: 'bg-success-50' },
        { label: 'Casos críticos detectados', value: DEMO_METRICS.casosCriticos, icon: AlertTriangle, color: 'text-danger-600', bg: 'bg-danger-50' },
        { label: 'Pendientes de validación profesional', value: DEMO_METRICS.pendientesValidacion, icon: Activity, color: 'text-warning-600', bg: 'bg-warning-50' },
      ]
    : [
        { label: 'Total valoraciones', value: stats.total, icon: Clipboard, color: 'text-clinical-600', bg: 'bg-clinical-50' },
        { label: 'Pacientes críticos', value: stats.criticos, icon: AlertTriangle, color: 'text-danger-600', bg: 'bg-danger-50' },
        { label: 'En vigilancia', value: stats.vigilancia, icon: Activity, color: 'text-warning-600', bg: 'bg-warning-50' },
        { label: 'Estables', value: stats.estables, icon: Users, color: 'text-success-600', bg: 'bg-success-50' },
      ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard clínico</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {useAcademicFallback && (
            <p className="text-sm text-clinical-700 mt-1">
              Caso académico activo. Contenido demostrativo para apoyo académico y clínico. Requiere validación profesional.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/valoracion/nueva" className="btn-primary">
            <PlusCircle className="w-4 h-4" />
            Nueva valoración
          </Link>
          <Link href="/valoraciones" className="btn-secondary">
            <FileText className="w-4 h-4" />
            Planes de cuidado
          </Link>
        </div>
      </div>

      <div className="bg-clinical-50 border border-clinical-100 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-clinical-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-clinical-800">
          <strong>Herramienta de apoyo a la decisión clínica.</strong> Todas las sugerencias generadas deben ser evaluadas
          y validadas por el profesional de enfermería responsable. No sustituye el juicio clínico.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(s => (
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
    </div>
  );
}
