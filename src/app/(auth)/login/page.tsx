'use client';

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================
// REMEINIA Care AI — Página de inicio de sesión
// ============================================================
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

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
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
    await signIn('credentials', {
      email: 'enfermera.demo@remeinia.org',
      password: 'Enfermera2024!',
      redirect: false,
    });
    setLoading(false);
    router.push('/dashboard');
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
          <p className="text-clinical-200 text-sm mt-1.5 font-medium">Plataforma inteligente de apoyo clínico para enfermería</p>
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
                    Este sistema contiene información clínica confidencial...
                  </p>
                </div>
                <button onClick={() => setShowAviso(false)}>×</button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Iniciar sesión</h2>

            {error && <div>{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
              <input {...register('email')} />
              <input {...register('password')} />
              <button type="submit" disabled={loading}>
                {loading ? 'Cargando...' : 'Ingresar'}
              </button>
            </form>

            <button onClick={loginDemo}>Demo</button>
          </div>
        </div>
      </div>
    </div>
  );
}
