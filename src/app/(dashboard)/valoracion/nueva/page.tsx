'use client';
// ============================================================
// REMEINIA Care AI — Formulario clínico inteligente
// 8 pasos + motor de análisis + generación del plan
// ============================================================
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, Activity, Wind, FlaskConical, TestTube2,
  Stethoscope, Cpu, FileText, ChevronRight, ChevronLeft,
  AlertTriangle, Save, Loader2, CheckCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import Step1Identificacion from '@/components/forms/Step1Identificacion';
import Step2SignosVitales from '@/components/forms/Step2SignosVitales';
import Step3Respiratorio from '@/components/forms/Step3Respiratorio';
import Step4Gasometria from '@/components/forms/Step4Gasometria';
import Step5Laboratorios from '@/components/forms/Step5Laboratorios';
import Step6Sistemas from '@/components/forms/Step6Sistemas';
import Step7Dispositivos from '@/components/forms/Step7Dispositivos';
import Step8Observaciones from '@/components/forms/Step8Observaciones';

// Esquema Zod simplificado del formulario
const schema = z.object({
  inicialesPaciente: z.string().min(2, 'Requerido'),
  edad: z.coerce.number().min(0).max(130),
  sexo: z.enum(['MASCULINO', 'FEMENINO', 'OTRO', 'NO_ESPECIFICADO']),
  servicio: z.string().min(2, 'Requerido'),
  cama: z.string().optional(),
  diagnosticoMedico: z.string().min(5, 'Requerido'),
  comorbilidades: z.array(z.string()).default([]),
  motivoAtencion: z.string().min(5, 'Requerido'),

  // Signos vitales
  frecuenciaCardiaca: z.coerce.number().optional(),
  frecuenciaRespir: z.coerce.number().optional(),
  tensionArterialSis: z.coerce.number().optional(),
  tensionArterialDias: z.coerce.number().optional(),
  presionArterialMedia: z.coerce.number().optional(),
  temperatura: z.coerce.number().optional(),
  saturacionO2: z.coerce.number().optional(),
  glucosaCapilar: z.coerce.number().optional(),
  escalaDolor: z.coerce.number().min(0).max(10).optional(),
  glasgow: z.coerce.number().min(3).max(15).optional(),
  diuresisHora: z.coerce.number().optional(),

  // Gasometría
  gaso_pH: z.coerce.number().optional(),
  gaso_PaCO2: z.coerce.number().optional(),
  gaso_PaO2: z.coerce.number().optional(),
  gaso_HCO3: z.coerce.number().optional(),
  gaso_SaO2: z.coerce.number().optional(),
  gaso_Lactato: z.coerce.number().optional(),

  // VM
  ventilacionMecanica: z.boolean().default(false),
  tipoO2: z.string().optional(),
  modoVentilatorio: z.string().optional(),
  fio2: z.coerce.number().optional(),
  peep: z.coerce.number().optional(),
  volumenTidal: z.coerce.number().optional(),
  frProgramada: z.coerce.number().optional(),
  presionPico: z.coerce.number().optional(),
  presionPlateau: z.coerce.number().optional(),
  secreciones: z.string().optional(),
  musculosAccesorios: z.boolean().default(false),
  sincroniaVentilador: z.boolean().default(true),

  // Labs + Sistemas + Dispositivos (JSON)
  laboratorios: z.record(z.any()).optional(),
  valoracionSistemas: z.record(z.string()).optional(),
  dispositivos: z.record(z.any()).optional(),

  // Observaciones
  observaciones: z.string().optional(),
  prioridadesPercibidas: z.string().optional(),
});

export type NuevaValoracionForm = z.infer<typeof schema>;

const PASOS = [
  { num: 1, label: 'Identificación', icon: User, short: 'ID' },
  { num: 2, label: 'Signos vitales', icon: Activity, short: 'SV' },
  { num: 3, label: 'Respiratorio / VM', icon: Wind, short: 'VM' },
  { num: 4, label: 'Gasometría', icon: FlaskConical, short: 'AGA' },
  { num: 5, label: 'Laboratorios', icon: TestTube2, short: 'Labs' },
  { num: 6, label: 'Valoración sistémica', icon: Stethoscope, short: 'Sx' },
  { num: 7, label: 'Dispositivos', icon: Cpu, short: 'Disp' },
  { num: 8, label: 'Observaciones', icon: FileText, short: 'Notas' },
];

export default function NuevaValoracionPage() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<NuevaValoracionForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      sexo: 'NO_ESPECIFICADO',
      ventilacionMecanica: false,
      musculosAccesorios: false,
      sincroniaVentilador: true,
      comorbilidades: [],
    },
  });

  const avanzar = async () => {
    // Validar solo los campos del paso actual
    const camposPorPaso: Record<number, (keyof NuevaValoracionForm)[]> = {
      1: ['inicialesPaciente', 'edad', 'sexo', 'servicio', 'diagnosticoMedico', 'motivoAtencion'],
    };
    const campos = camposPorPaso[paso] ?? [];
    const valido = campos.length === 0 || await methods.trigger(campos);
    if (valido && paso < 8) setPaso(p => p + 1);
  };

  const onSubmit = async (data: NuevaValoracionForm) => {
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch('/api/valoraciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error al guardar');
      router.push(`/plan-cuidados/${json.valoracionId}`);
    } catch (e: any) {
      setError(e.message);
      setGuardando(false);
    }
  };

  const pasoActual = PASOS[paso - 1];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5 pb-24 md:pb-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Nueva valoración clínica</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Paso {paso} de 8 — {pasoActual.label}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-clinical-50 px-3 py-1.5 rounded-full border border-clinical-100">
            <AlertTriangle className="w-3.5 h-3.5 text-clinical-600" />
            <span className="text-xs text-clinical-700 font-medium">Herramienta de apoyo</span>
          </div>
        </div>

        {/* Stepper horizontal */}
        <div className="card-clinical py-4">
          {/* Desktop: todos los pasos */}
          <div className="hidden md:flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 mx-8" />
            {PASOS.map((p, i) => (
              <button
                key={p.num}
                type="button"
                onClick={() => { if (p.num < paso) setPaso(p.num); }}
                className={clsx(
                  'relative flex flex-col items-center gap-1.5 flex-1 z-10',
                  p.num < paso ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all border-2',
                  p.num === paso ? 'bg-clinical-500 border-clinical-500 text-white shadow-clinical' :
                  p.num < paso ? 'bg-success-500 border-success-500 text-white' :
                  'bg-white border-gray-200 text-gray-400',
                )}>
                  {p.num < paso ? <CheckCircle className="w-4 h-4" /> : <p.icon className="w-3.5 h-3.5" />}
                </div>
                <span className={clsx(
                  'text-xs font-medium text-center leading-tight max-w-[60px]',
                  p.num === paso ? 'text-clinical-600' : p.num < paso ? 'text-success-600' : 'text-gray-400',
                )}>
                  {p.label}
                </span>
              </button>
            ))}
          </div>

          {/* Móvil: solo paso actual */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-clinical-600">{pasoActual.label}</span>
              <span className="text-xs text-gray-400">{paso}/8</span>
            </div>
            <div className="flex gap-1">
              {PASOS.map(p => (
                <div
                  key={p.num}
                  className={clsx(
                    'flex-1 h-1.5 rounded-full transition-all',
                    p.num < paso ? 'bg-success-400' :
                    p.num === paso ? 'bg-clinical-500' :
                    'bg-gray-100',
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Error global */}
        {error && (
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl flex items-center gap-3 text-danger-700 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Contenido del paso */}
        <div className="card-clinical animate-fade-in">
          {paso === 1 && <Step1Identificacion />}
          {paso === 2 && <Step2SignosVitales />}
          {paso === 3 && <Step3Respiratorio />}
          {paso === 4 && <Step4Gasometria />}
          {paso === 5 && <Step5Laboratorios />}
          {paso === 6 && <Step6Sistemas />}
          {paso === 7 && <Step7Dispositivos />}
          {paso === 8 && <Step8Observaciones />}
        </div>

        {/* Navegación */}
        <div className="flex items-center justify-between pt-2 fixed md:relative bottom-16 md:bottom-auto left-0 right-0 md:left-auto md:right-auto bg-white md:bg-transparent border-t md:border-0 border-gray-100 px-4 md:px-0 py-3 md:py-0 z-40">
          <button
            type="button"
            onClick={() => setPaso(p => p - 1)}
            disabled={paso === 1}
            className="btn-secondary disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          <div className="flex items-center gap-2">
            {paso < 8 ? (
              <button type="button" onClick={avanzar} className="btn-primary">
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={guardando}
                className="btn-primary bg-accent-600 hover:bg-accent-700 px-6"
              >
                {guardando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generando plan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Generar plan de cuidados
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
