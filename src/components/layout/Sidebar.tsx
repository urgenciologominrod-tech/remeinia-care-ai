'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, PlusCircle, ClipboardList, Activity,
  BookOpen, Settings, ChevronLeft, Shield, Users, FileText,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { RolUsuario } from '@/types/clinical';

interface Props { rol: RolUsuario; }

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ENFERMERO','SUPERVISOR','ADMINISTRADOR','REVISOR_REMEINIA'] },
  { href: '/valoracion/nueva', label: 'Nueva valoración', icon: PlusCircle, roles: ['ENFERMERO','SUPERVISOR'] },
  { href: '/valoraciones', label: 'Valoraciones', icon: ClipboardList, roles: ['ENFERMERO','SUPERVISOR','ADMINISTRADOR'] },
  { href: '/evidencia', label: 'Base de evidencia', icon: BookOpen, roles: ['ENFERMERO','SUPERVISOR','ADMINISTRADOR','REVISOR_REMEINIA'] },
  { href: '/reportes', label: 'Reportes', icon: FileText, roles: ['SUPERVISOR','ADMINISTRADOR'] },
  { href: '/admin', label: 'Administración', icon: Settings, roles: ['ADMINISTRADOR'] },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users, roles: ['ADMINISTRADOR'] },
  { href: '/remeinia', label: 'Módulo REMEINIA', icon: Shield, roles: ['REVISOR_REMEINIA','ADMINISTRADOR'] },
];

export default function Sidebar({ rol }: Props) {
  const pathname = usePathname();
  const items = navItems.filter(i => i.roles.includes(rol));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-clinical-950 border-r border-clinical-800 h-screen">
        {/* Logo */}
        <div className="p-5 border-b border-clinical-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-clinical-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">REMEINIA Care AI</p>
              <p className="text-clinical-400 text-xs">Apoyo clínico</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-clinical-500 text-white shadow-sm'
                    : 'text-clinical-300 hover:bg-clinical-800/60 hover:text-white',
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-clinical-800">
          <div className="flex items-center gap-2 px-2">
            <Shield className="w-3.5 h-3.5 text-clinical-400" />
            <p className="text-clinical-500 text-xs">Aval REMEINIA v1.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          {items.slice(0, 5).map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                  active ? 'text-clinical-600' : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <item.icon className={clsx('w-5 h-5', active && 'text-clinical-500')} />
                <span className="text-[10px] leading-tight">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
