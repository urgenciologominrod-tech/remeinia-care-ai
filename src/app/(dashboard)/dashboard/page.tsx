import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const rol = (session?.user as any)?.rol;

  // Cargar valoraciones recientes
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
      {/* Encabezado */}
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

      {/* Aviso herramienta */}
      <div className="bg-clinical-50 border border-clinical-100 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-clinical-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-clinical-800">
          <strong>Herramienta de apoyo a la decisión clínica.</strong> Todas las sugerencias generadas deben ser evaluadas
          y validadas por el profesional de enfermería responsable. No sustituye el juicio clínico.
        </p>
      </div>

      {/* Estadísticas */}
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

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Accesos rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            { href: '/valoracion/nueva', label: 'Nueva valoración', icon: PlusCircle, color: 'bg-clinical-500' },
            { href: '/valoracion/nueva?modulo=gasometria', label: 'Gasometría rápida', icon: FlaskConical, color: 'bg-accent-500' },
            { href: '/valoracion/nueva?modulo=ventilacion', label: 'Ventilación', icon: Wind, color: 'bg-slate-600' },
            { href: '/evidencia', label: 'Base de evidencia', icon: Stethoscope, color: 'bg-purple-500' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="card-clinical flex flex-col items-center justify-center gap-3 py-5 text-center hover:border-clinical-200 transition-all group"
            >
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', item.color)}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-clinical-600 transition-colors">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Lista de valoraciones recientes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-700">Valoraciones recientes</h2>
          <Link href="/valoraciones" className="text-xs text-clinical-600 hover:text-clinical-700 font-medium flex items-center gap-1">
            Ver todas <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {valoraciones.length === 0 ? (
          <div className="card-clinical flex flex-col items-center justify-center py-12 text-center">
            <Clipboard className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Sin valoraciones registradas</p>
            <p className="text-sm text-gray-400 mt-1">Crea la primera valoración clínica</p>
            <Link href="/valoracion/nueva" className="btn-primary mt-4">
              <PlusCircle className="w-4 h-4" />
              Nueva valoración
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {valoraciones.map(val => {
              const estado = COLORES_ESTADO[val.estadoPaciente as keyof typeof COLORES_ESTADO];
              return (
                <Link
                  key={val.id}
                  href={`/valoracion/${val.id}`}
                  className="card-clinical flex items-center gap-4 hover:border-clinical-200 transition-all group"
                >
                  {/* Semáforo */}
                  <div className={clsx('w-1.5 rounded-full self-stretch min-h-[48px]', {
                    'bg-danger-500': val.estadoPaciente === 'CRITICO',
                    'bg-warning-500': val.estadoPaciente === 'VIGILANCIA',
                    'bg-success-500': val.estadoPaciente === 'ESTABLE',
                    'bg-gray-300': val.estadoPaciente === 'DESCONOCIDO',
                  })} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm">{val.inicialesPaciente}</span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-xs text-gray-500">{val.edad} años · {val.servicio}</span>
                      {val.esDemo && <span className="badge-demo">Demo</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{val.diagnosticoMedico}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', estado.bg, estado.text)}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {estado.label}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(val.fechaHora), { addSuffix: true, locale: es })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{val.usuario.nombre} {val.usuario.apellidos}</p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-clinical-500 transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
