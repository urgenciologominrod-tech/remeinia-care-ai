export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import Link from 'next/link';
import {
  PlusCircle,
  AlertTriangle,
  Activity,
  Clipboard,
  FileText,
  BarChart3,
} from 'lucide-react';
import { clsx } from 'clsx';

const ACADEMIC_CARDS = [
  {
    label: 'Valoraciones académicas',
    value: 3,
    icon: Clipboard,
    color: 'text-clinical-600',
    bg: 'bg-clinical-50',
  },
  {
    label: 'Planes generados',
    value: 3,
    icon: FileText,
    color: 'text-success-600',
    bg: 'bg-success-50',
  },
  {
    label: 'Casos críticos detectados',
    value: 1,
    icon: AlertTriangle,
    color: 'text-danger-600',
    bg: 'bg-danger-50',
  },
  {
    label: 'Pendientes de validación profesional',
    value: 3,
    icon: Activity,
    color: 'text-warning-600',
    bg: 'bg-warning-50',
  },
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bienvenida a REMEINIA Care AI</h1>
          <p className="text-sm text-gray-600 mt-1">
            Plataforma académica de apoyo al Proceso de Atención de Enfermería mediante inteligencia artificial
          </p>
          <p className="text-sm text-clinical-700 mt-2">
            Contenido demostrativo para apoyo académico y clínico. Requiere validación profesional por personal de enfermería responsable.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/valoracion/nueva" className="btn-primary">
            <PlusCircle className="w-4 h-4" />
            Nueva valoración
          </Link>
          <Link href="/valoraciones" className="btn-secondary">
            <FileText className="w-4 h-4" />
            Ver valoraciones
          </Link>
          <Link href="/reportes" className="btn-secondary">
            <BarChart3 className="w-4 h-4" />
            Reportes
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
        {ACADEMIC_CARDS.map((card) => (
          <div key={card.label} className="card-clinical">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1 leading-tight">{card.label}</p>
              </div>
              <div className={clsx('p-2.5 rounded-xl', card.bg)}>
                <card.icon className={clsx('w-5 h-5', card.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
