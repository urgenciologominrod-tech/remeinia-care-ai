'use client';
import { signOut } from 'next-auth/react';
import { Bell, LogOut, UserCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Props {
  user: { name?: string | null; email?: string | null; rol?: string; servicio?: string };
}

const ROL_LABEL: Record<string, string> = {
  ENFERMERO: 'Enfermero/a',
  SUPERVISOR: 'Supervisor/a',
  ADMINISTRADOR: 'Administrador',
  REVISOR_REMEINIA: 'Revisor REMEINIA',
};

export default function TopBar({ user }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      {/* Título de contexto */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-800">REMEINIA Care AI</p>
          <p className="text-xs text-gray-400">Plataforma de apoyo clínico</p>
        </div>
      </div>

      {/* Aviso herramienta */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-clinical-50 border border-clinical-100 rounded-full">
        <span className="w-1.5 h-1.5 bg-clinical-500 rounded-full animate-pulse" />
        <span className="text-xs text-clinical-700 font-medium">Herramienta de apoyo — verificar con juicio clínico</span>
      </div>

      {/* Usuario */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-4.5 h-4.5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-7 h-7 bg-clinical-100 rounded-full flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-clinical-600" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-700 leading-tight">{user.name}</p>
              <p className="text-[10px] text-gray-400">{ROL_LABEL[user.rol ?? ''] ?? user.rol}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-gray-50">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                {user.servicio && <p className="text-xs text-clinical-600 mt-0.5">{user.servicio}</p>}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
