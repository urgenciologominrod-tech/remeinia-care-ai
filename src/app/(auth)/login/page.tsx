'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shield, AlertTriangle, Info } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'Contraseña requerida'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAviso, setShowAviso] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Credenciales incorrectas o acceso no autorizado.');
    } else {
      router.push('/dashboard');
    }
  };

  const loginDemo = async () => {
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email: 'enfermera.demo@remeinia.org',
      password: 'Enfermera2024!',
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('No fue posible ingresar en modo demo.');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-clinical-950 via-clinical-900 to-clinical-700">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-clinical-600 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm border border-white/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">REMEINIA Care AI</h1>
          <p className="text-clinical-200 text-sm mt-1.5 font-medium">
            Plataforma inteligente de apoyo clínico para enfermería
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <span className="w-2 h-2 bg-clinical-400 rounded-full" />
            <span className="text-clinical-300 text-xs">Aval académico REMEINIA</span>
          </div>
        </div>

        {showAviso && (
          <div className="w-full max-w-md mb-5 animate-slide-up">
            <div className="bg-amber-500/15 border border-amber-400/30 rounded-xl p-4 text-amber-100">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-300" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-amber-200 mb-1">Aviso de confidencialidad</p>
                  <p className="text-xs leading-relaxed text-amber-100/90">
                    Este sistema contiene información clínica confidencial. El acceso no autorizado está prohibido.
                    REMEINIA Care AI es una herramienta de <strong>apoyo a la toma de decisiones</strong>. No sustituye el juicio clínico profesional.
                  </p>
                </div>
                <button
                  onClick={() => setShowAviso(false)}
                  className="text-amber-300/60 hover:text-amber-200 text-lg leading-none flex-shrink-0"
                  type="button"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Iniciar sesión</h2>

            {error && (
              <div className="mb-4 p-3.5 bg-danger-50 border border-danger-200 rounded-lg flex items-center gap-2 text-danger-700 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label-clinical">Correo electrónico institucional</label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@institucion.org"
                  className="input-clinical"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-danger-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="label-clinical">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="input-clinical pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-danger-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  className="text-xs text-clinical-600 hover:text-clinical-700 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verificando...
                  </span>
                ) : (
                  'Ingresar al sistema'
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">o</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
              <div className="flex items-start gap-2.5 mb-3">
                <Info className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-purple-800">Modo demostración</p>
                  <p className="text-xs text-purple-600 mt-0.5">
                    Los pacientes demo son <strong>completamente ficticios</strong>. Solo con fines educativos.
                  </p>
                </div>
              </div>

              <button
                onClick={loginDemo}
                disabled={loading}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Ingresar en modo demo
              </button>

              <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs text-purple-600">
                <div className="bg-purple-100/50 rounded p-1.5">
                  <p className="font-medium">Admin:</p>
                  <p>admin@remeinia.org</p>
                  <p>Admin2024!</p>
                </div>
                <div className="bg-purple-100/50 rounded p-1.5">
                  <p className="font-medium">Enfermera:</p>
                  <p>enfermera.demo@</p>
                  <p>Enfermera2024!</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-clinical-300/70 text-xs mt-5">
            REMEINIA Care AI v1.0 • Información confidencial • Uso exclusivo del personal de salud
          </p>
        </div>
      </div>
    </div>
  );
}