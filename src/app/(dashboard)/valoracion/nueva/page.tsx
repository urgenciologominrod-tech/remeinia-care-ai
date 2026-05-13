'use client';
// ============================================================
// REMEINIA Care AI — Formulario clínico inteligente
// 8 pasos + motor de análisis + generación del plan
// ============================================================
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider, type FieldPath } from 'react-hook-form';
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
import { ACADEMIC_CASES } from '@/lib/academic-cases';

// Esquema Zod simplificado del formulario
const schema = z.object({
  inicialesPaciente: z.string().min(2, 'El identificador del paciente es obligatorio'),
  edad: z.coerce.number().min(0, 'La edad mínima es 0 años').max(120, 'La edad máxima permitida es 120 años'),
  sexo: z.enum(['MASCULINO', 'FEMENINO', 'OTRO', 'NO_ESPECIFICADO']),
  servicio: z.string().min(2, 'El servicio es obligatorio'),
  cama: z.string().optional(),
  diagnosticoMedico: z.string().min(5, 'El diagnóstico médico es obligatorio'),
  comorbilidades: z.array(z.string()).default([]),
  motivoAtencion: z.string().min(5, 'El motivo de atención es obligatorio'),

  // Signos vitales
  frecuenciaCardiaca: z.coerce.number().min(20, 'FC fuera de rango fisiológico').max(250, 'FC fuera de rango fisiológico').optional(),
  frecuenciaRespir: z.coerce.number().min(4, 'FR fuera de rango fisiológico').max(80, 'FR fuera de rango fisiológico').optional(),
  tensionArterialSis: z.coerce.number().min(40, 'PAS fuera de rango fisiológico').max(300, 'PAS fuera de rango fisiológico').optional(),
  tensionArterialDias: z.coerce.number().min(20, 'PAD fuera de rango fisiológico').max(180, 'PAD fuera de rango fisiológico').optional(),
  presionArterialMedia: z.coerce.number().min(20, 'PAM fuera de rango fisiológico').max(200, 'PAM fuera de rango fisiológico').optional(),
  temperatura: z.coerce.number().min(30, 'Temperatura fuera de rango fisiológico').max(45, 'Temperatura fuera de rango fisiológico').optional(),
  saturacionO2: z.coerce.number().min(0, 'SpO₂ debe estar entre 0 y 100%').max(100, 'SpO₂ debe estar entre 0 y 100%').optional(),
  glucosaCapilar: z.coerce.number().min(20, 'Glucosa fuera de rango fisiológico').max(800, 'Glucosa fuera de rango fisiológico').optional(),
  escalaDolor: z.coerce.number().min(0).max(10).optional(),
  glasgow: z.coerce.number().min(3).max(15).optional(),
  diuresisHora: z.coerce.number().min(0, 'La diuresis no puede ser negativa').optional(),

  // Gasometría
  gaso_pH: z.coerce.number().min(6.8, 'pH fuera de rango fisiológico').max(7.8, 'pH fuera de rango fisiológico').optional(),
  gaso_PaCO2: z.coerce.number().min(10, 'PaCO₂ fuera de rango fisiológico').max(150, 'PaCO₂ fuera de rango fisiológico').optional(),
  gaso_PaO2: z.coerce.number().min(20, 'PaO₂ fuera de rango fisiológico').max(600, 'PaO₂ fuera de rango fisiológico').optional(),
  gaso_HCO3: z.coerce.number().min(0, 'HCO₃⁻ fuera de rango fisiológico').max(60, 'HCO₃⁻ fuera de rango fisiológico').optional(),
  gaso_SaO2: z.coerce.number().min(0, 'SaO₂ debe estar entre 0 y 100%').max(100, 'SaO₂ debe estar entre 0 y 100%').optional(),
  gaso_Lactato: z.coerce.number().min(0, 'Lactato fuera de rango fisiológico').max(30, 'Lactato fuera de rango fisiológico').optional(),

  // VM
  ventilacionMecanica: z.boolean().default(false),
  tipoO2: z.string().optional(),
  modoVentilatorio: z.string().optional(),
  fio2: z.coerce.number().optional(),
  peep: z.coerce.number().min(0, 'La PEEP no puede ser negativa').optional(),
  volumenTidal: z.coerce.number().min(0, 'El volumen tidal no puede ser negativo').optional(),
  frProgramada: z.coerce.number().min(0, 'La FR programada no puede ser negativa').optional(),
  presionPico: z.coerce.number().min(0, 'La presión pico no puede ser negativa').optional(),
  presionPlateau: z.coerce.number().min(0, 'La presión plateau no puede ser negativa').optional(),
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
  const [procesoMensaje, setProcesoMensaje] = useState<string>('');
  const [mostrarCasos, setMostrarCasos] = useState(false);

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

  const hasNumericValue = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

  const validateStep = async (step: number): Promise<boolean> => {
    const values = methods.getValues();
    const markError = (field: FieldPath<NuevaValoracionForm>, message: string) =>
      methods.setError(field, { type: 'manual', message });

    switch (step) {
      case 1: {
        return methods.trigger(['inicialesPaciente', 'edad', 'sexo', 'servicio', 'diagnosticoMedico', 'motivoAtencion']);
      }
      case 2: {
        const baseValid = await methods.trigger([
          'frecuenciaCardiaca', 'frecuenciaRespir', 'tensionArterialSis', 'tensionArterialDias', 'presionArterialMedia',
          'temperatura', 'saturacionO2', 'glucosaCapilar', 'escalaDolor', 'glasgow', 'diuresisHora',
        ]);
        const anyVitalCaptured = [
          values.frecuenciaCardiaca, values.frecuenciaRespir, values.temperatura, values.saturacionO2,
          values.tensionArterialSis, values.tensionArterialDias, values.presionArterialMedia,
        ].some(hasNumericValue);
        if (!anyVitalCaptured) {
          markError('saturacionO2', 'Capture al menos un signo vital para continuar.');
          return false;
        }
        return baseValid;
      }
      case 3: {
        const baseValid = await methods.trigger(['fio2', 'peep', 'volumenTidal', 'frProgramada', 'presionPico', 'presionPlateau', 'modoVentilatorio', 'tipoO2']);
        if (!values.ventilacionMecanica) return baseValid;

        let isValid = baseValid;
        if (!values.modoVentilatorio?.trim()) {
          markError('modoVentilatorio', 'Cuando hay ventilación mecánica activa, el modo ventilatorio es obligatorio.');
          isValid = false;
        }
        if (!values.tipoO2?.trim()) {
          markError('tipoO2', 'Cuando hay ventilación mecánica activa, seleccione el tipo de soporte respiratorio.');
          isValid = false;
        }
        if (hasNumericValue(values.fio2)) {
          const fio2Valida = (values.fio2 >= 0.21 && values.fio2 <= 1) || (values.fio2 >= 21 && values.fio2 <= 100);
          if (!fio2Valida) {
            markError('fio2', 'La FiO₂ debe capturarse como fracción (0.21 a 1) o porcentaje (21 a 100).');
            isValid = false;
          }
        }
        return isValid;
      }
      case 4: {
        const baseValid = await methods.trigger(['gaso_pH', 'gaso_PaCO2', 'gaso_PaO2', 'gaso_HCO3', 'gaso_SaO2', 'gaso_Lactato']);
        const gasoValues = [values.gaso_pH, values.gaso_PaCO2, values.gaso_PaO2, values.gaso_HCO3, values.gaso_SaO2, values.gaso_Lactato];
        const anyGasoCaptured = gasoValues.some(hasNumericValue);
        if (!anyGasoCaptured) return baseValid;

        let isValid = baseValid;
        if (hasNumericValue(values.fio2)) {
          const fio2Valida = (values.fio2 >= 0.21 && values.fio2 <= 1) || (values.fio2 >= 21 && values.fio2 <= 100);
          if (!fio2Valida) {
            markError('fio2', 'Para interpretar gasometría, la FiO₂ debe estar entre 0.21–1 o 21–100%.');
            isValid = false;
          }
        }
        return isValid;
      }
      default:
        return true;
    }
  };

  const avanzar = async () => {
    const valido = await validateStep(paso);
    if (valido && paso < 8) setPaso(p => p + 1);
  };

  const cargarCasoAcademico = (id: string) => {
    const selected = ACADEMIC_CASES.find((c) => c.id === id);
    if (!selected) return;
    Object.entries(selected.data).forEach(([key, value]) => {
      methods.setValue(key as keyof NuevaValoracionForm, value as any, { shouldDirty: true });
    });
    setError(null);
  };

  const onSubmit = async (data: NuevaValoracionForm) => {
    setGuardando(true);
    setError(null);
    setProcesoMensaje('Analizando valoración clínica…');
    try {
      await new Promise((r) => setTimeout(r, 450));
      setProcesoMensaje('Generando Proceso de Atención de Enfermería…');
      await new Promise((r) => setTimeout(r, 450));
      setProcesoMensaje('Integrando diagnósticos sugeridos, resultados, intervenciones y criterios de evaluación…');
      const res = await fetch('/api/valoraciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error al guardar');

      if (json.isDemo && json.plan) {
        sessionStorage.setItem('remeinia_demo_plan', JSON.stringify({
          id: json.planId,
          plan: json.plan,
          estadoPaciente: json.estadoPaciente,
          alertas: json.alertas ?? [],
          generadoEn: new Date().toISOString(),
          valoracion: data,
        }));
        router.push('/plan-cuidados/demo');
        return;
      }

      router.push(`/plan-cuidados/${json.valoracionId}`);
    } catch (e: any) {
      setError('No fue posible generar el plan de cuidados. Verifique la información capturada e intente nuevamente.');
      setGuardando(false);
      setProcesoMensaje('');
    }
  };

  const pasoActual = PASOS[paso - 1];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5 pb-24 md:pb-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">REMEINIA Care AI · Nueva valoración clínica</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Paso {paso} de 8 — {pasoActual.label}
            </p>
            <p className="text-xs text-clinical-600 mt-1">Valoración clínica inteligente para apoyo al Proceso de Atención de Enfermería</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-clinical-50 px-3 py-1.5 rounded-full border border-clinical-100">
            <AlertTriangle className="w-3.5 h-3.5 text-clinical-600" />
            <span className="text-xs text-clinical-700 font-medium">Herramienta de apoyo</span>
          </div>
        </div>

        {/* Stepper horizontal */}
        <div className="card-clinical">
          <button
            type="button"
            onClick={() => setMostrarCasos((v) => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">Casos académicos precargables</p>
              <p className="text-xs text-gray-500">Contenido demostrativo para apoyo académico y clínico. Requiere validación profesional.</p>
            </div>
            <span className="text-xs text-clinical-600 font-semibold">{mostrarCasos ? 'Ocultar' : 'Mostrar'}</span>
          </button>
          {mostrarCasos && (
            <div className="mt-4 grid md:grid-cols-3 gap-3">
              {ACADEMIC_CASES.map((caso) => (
                <button
                  key={caso.id}
                  type="button"
                  onClick={() => cargarCasoAcademico(caso.id)}
                  className="text-left border border-clinical-100 rounded-xl p-3 hover:border-clinical-300 hover:bg-clinical-50/40 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-800">{caso.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{caso.descripcion}</p>
                  <p className="text-xs text-clinical-700 mt-2 font-medium">Clasificación esperada: {caso.clasificacionEsperada}</p>
                </button>
              ))}
            </div>
          )}
        </div>

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
        {guardando && procesoMensaje && (
          <div className="p-4 bg-clinical-50 border border-clinical-200 rounded-xl flex items-center gap-3 text-clinical-700 text-sm animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            {procesoMensaje}
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
                    <Loader2 className="w-4 h-4 animate-spin" /> Procesando valoración…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Guardar y generar plan de cuidados
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
