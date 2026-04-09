import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Users, Settings, BookOpen, FileText, Activity,
  Database, Shield, AlertTriangle, ChevronRight, ToggleLeft,
} from 'lucide-react';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const rol = (session?.user as any)?.rol;
  if (rol !== 'ADMINISTRADOR') redirect('/dashboard');

  const [totalUsuarios, totalValoraciones, totalCatalogoDx, totalEvidencias, ultimosLogs] = await Promise.all([
    prisma.usuario.count(),
    prisma.valoracion.count(),
    prisma.catalogoDiagnostico.count(),
    prisma.evidenciaClinica.count(),
    prisma.bitacoraAccion.findMany({
      take: 10,
      orderBy: { fechaHora: 'desc' },
      include: { usuario: { select: { nombre: true, apellidos: true } } },
    }),
  ]);

  const tarjetas = [
    { label: 'Usuarios registrados', value: totalUsuarios, icon: Users, href: '/admin/usuarios', color: 'text-clinical-600 bg-clinical-50' },
    { label: 'Valoraciones totales', value: totalValoraciones, icon: Activity, href: '/valoraciones', color: 'text-success-600 bg-success-50' },
    { label: 'Diagnósticos en catálogo', value: totalCatalogoDx, icon: Database, href: '/admin/catalogos', color: 'text-accent-600 bg-accent-50' },
    { label: 'Evidencias registradas', value: totalEvidencias, icon: BookOpen, href: '/evidencia', color: 'text-purple-600 bg-purple-50' },
  ];

  const ACCIONES_LABEL: Record<string, string> = {
    login: 'Inicio de sesión',
    crear_valoracion: 'Valoración creada',
    exportar_pdf: 'Exportación PDF',
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Panel de administración</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gestión del sistema REMEINIA Care AI</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tarjetas.map(t => (
          <Link key={t.href} href={t.href} className="card-clinical hover:border-clinical-200 group">
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2.5 rounded-xl ${t.color}`}>
                <t.icon className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-clinical-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{t.value}</p>
            <p className="text-xs text-gray-500 mt-1">{t.label}</p>
          </Link>
        ))}
      </div>

      {/* Módulos de configuración */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Módulos de configuración</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/admin/usuarios', label: 'Gestión de usuarios', desc: 'Crear, editar, activar/desactivar usuarios y roles', icon: Users },
            { href: '/admin/catalogos', label: 'Catálogos clínicos', desc: 'Cargar catálogos licenciados de diagnósticos, NOC y NIC', icon: Database },
            { href: '/admin/evidencia', label: 'Repositorio de evidencia', desc: 'Gestionar guías clínicas y referencias científicas', icon: BookOpen },
            { href: '/admin/reglas', label: 'Reglas clínicas', desc: 'Editar umbrales y lógica de alertas del motor clínico', icon: Settings },
            { href: '/admin/modulos', label: 'Módulos activos', desc: 'Activar o desactivar funcionalidades del sistema', icon: ToggleLeft },
            { href: '/admin/branding', label: 'Identidad visual', desc: 'Personalización de logo, colores y textos institucionales', icon: Shield },
          ].map(m => (
            <Link key={m.href} href={m.href} className="card-clinical flex items-start gap-4 hover:border-clinical-200 group transition-all">
              <div className="w-10 h-10 bg-clinical-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <m.icon className="w-5 h-5 text-clinical-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-clinical-600 transition-colors">{m.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-clinical-500 mt-1 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Bitácora de acciones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-700">Bitácora de acciones recientes</h2>
          <Link href="/admin/bitacora" className="text-xs text-clinical-600 hover:text-clinical-700 font-medium flex items-center gap-1">
            Ver completa <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="card-clinical p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Usuario</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Acción</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Fecha y hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ultimosLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-700">{log.usuario.nombre} {log.usuario.apellidos}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-clinical-50 text-clinical-700 rounded-full text-xs">
                      {ACCIONES_LABEL[log.accion] ?? log.accion}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">
                    {new Date(log.fechaHora).toLocaleString('es-MX')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aviso de seguridad */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Recomendaciones de seguridad</p>
          <ul className="text-xs text-amber-700 mt-1 space-y-1 list-disc list-inside">
            <li>Revisar periódicamente los usuarios activos y sus roles</li>
            <li>Los catálogos clínicos cargados deben contar con licencia apropiada</li>
            <li>No compartir credenciales de administrador</li>
            <li>Realizar respaldos periódicos de la base de datos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
