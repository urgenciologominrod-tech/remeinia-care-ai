'use client';
import { useFormContext, useWatch } from 'react-hook-form';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';
import type { NuevaValoracionForm } from '@/app/(dashboard)/valoracion/nueva/page';

const campo = (
  label: string, name: any, unit: string, placeholder: string,
  min?: number, max?: number, normal?: [number, number],
) => ({ label, name, unit, placeholder, min, max, normal });

const CAMPOS_SV = [
  campo('Frecuencia cardíaca', 'frecuenciaCardiaca', 'lpm', '60-100', 0, 300, [60, 100]),
  campo('Frecuencia respiratoria', 'frecuenciaRespir', 'rpm', '12-20', 0, 80, [12, 20]),
  campo('TA sistólica', 'tensionArterialSis', 'mmHg', '100-140', 0, 300, [90, 140]),
  campo('TA diastólica', 'tensionArterialDias', 'mmHg', '60-90', 0, 200, [60, 90]),
  campo('PAM', 'presionArterialMedia', 'mmHg', '70-105', 0, 200, [70, 105]),
  campo('Temperatura', 'temperatura', '°C', '36-37.5', 30, 45, [36, 37.5]),
  campo('SpO₂', 'saturacionO2', '%', '≥95%', 0, 100, [94, 100]),
  campo('Glucosa capilar', 'glucosaCapilar', 'mg/dL', '70-140', 0, 800, [70, 140]),
  campo('Escala de dolor', 'escalaDolor', '/10', '0-10', 0, 10, [0, 3]),
  campo('Glasgow', 'glasgow', '/15', '3-15', 3, 15, [13, 15]),
  campo('Diuresis', 'diuresisHora', 'mL/kg/hr', '≥0.5', 0, 20, [0.5, 5]),
];

function valorFueraRango(val: number | undefined, normal?: [number, number]): 'bajo' | 'alto' | 'normal' | 'sin_dato' {
  if (val === undefined || val === null || isNaN(val)) return 'sin_dato';
  if (!normal) return 'normal';
  if (val < normal[0]) return 'bajo';
  if (val > normal[1]) return 'alto';
  return 'normal';
}

export default function Step2SignosVitales() {
  const { register, watch } = useFormContext<NuevaValoracionForm>();
  const values = watch();

  // Calcular PAM automáticamente
  const sis = watch('tensionArterialSis');
  const dias = watch('tensionArterialDias');
  const pamCalc = sis && dias ? Math.round((sis + 2 * dias) / 3) : null;

  return (
    <div className="form-section">
      <h3 className="form-section-title">Paso 2 — Signos vitales</h3>

      <div className="bg-clinical-50 border border-clinical-100 rounded-lg p-3 mb-5 flex items-start gap-2">
        <Info className="w-4 h-4 text-clinical-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-clinical-700">
          Los valores marcados en rojo o amarillo activan alertas clínicas automáticas. Todos los campos son opcionales,
          pero a más datos, mayor precisión de las sugerencias.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {CAMPOS_SV.map(c => {
          const rawVal = values[c.name as keyof typeof values];
          const numVal = typeof rawVal === 'number' ? rawVal : typeof rawVal === 'string' ? parseFloat(rawVal as string) : undefined;
          const estado = valorFueraRango(numVal, c.normal);
          return (
            <div key={c.name} className={clsx(
              'rounded-xl border p-3.5 transition-all',
              estado === 'bajo' || estado === 'alto' ? 'border-warning-200 bg-warning-50' :
              estado === 'normal' ? 'border-success-100 bg-success-50/30' :
              'border-gray-100 bg-white',
            )}>
              <label className="text-xs font-semibold text-slate-700 block mb-2">{c.label}</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="any"
                  min={c.min}
                  max={c.max}
                  placeholder={c.placeholder}
                  className={clsx(
                    'flex-1 min-w-0 px-2.5 py-2 text-sm font-semibold rounded-lg border outline-none transition-all',
                    'focus:ring-2 focus:ring-clinical-500',
                    estado === 'bajo' || estado === 'alto' ? 'border-warning-300 bg-white' :
                    estado === 'normal' ? 'border-success-200 bg-white' : 'border-gray-200 bg-white',
                  )}
                  {...register(c.name as keyof NuevaValoracionForm)}
                />
                <span className="text-xs text-gray-400 flex-shrink-0">{c.unit}</span>
              </div>

              {/* Indicador de estado */}
              <div className="mt-1.5 flex items-center gap-1">
                {estado === 'normal' && numVal !== undefined && (
                  <CheckCircle className="w-3 h-3 text-success-500" />
                )}
                {(estado === 'bajo' || estado === 'alto') && (
                  <AlertTriangle className="w-3 h-3 text-warning-500" />
                )}
                <span className={clsx('text-xs', {
                  'text-success-600': estado === 'normal' && numVal !== undefined,
                  'text-warning-600': estado === 'bajo' || estado === 'alto',
                  'text-gray-300': estado === 'sin_dato',
                })}>
                  {estado === 'sin_dato' ? `Ref: ${c.placeholder}` :
                   estado === 'bajo' ? 'Bajo rango' :
                   estado === 'alto' ? 'Alto rango' :
                   'En rango'}
                </span>
              </div>
            </div>
          );
        })}

        {/* PAM calculada */}
        {pamCalc && (
          <div className="sm:col-span-2 bg-clinical-50 border border-clinical-100 rounded-xl p-3.5">
            <p className="text-xs font-semibold text-clinical-700">PAM calculada automáticamente</p>
            <p className="text-2xl font-bold text-clinical-600 mt-1">{pamCalc} <span className="text-sm font-normal text-clinical-400">mmHg</span></p>
            <p className="text-xs text-clinical-500 mt-1">Fórmula: (PAS + 2×PAD) / 3</p>
            {pamCalc < 65 && (
              <div className="mt-2 flex items-center gap-1.5 text-danger-600">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">PAM &lt; 65 mmHg — Alerta de hipoperfusión</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dolor visual */}
      {values.escalaDolor !== undefined && values.escalaDolor !== null && (
        <div className="mt-4 bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Escala visual del dolor</p>
          <div className="flex items-center gap-0.5">
            {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
              <div
                key={n}
                className={clsx(
                  'flex-1 h-6 rounded transition-all flex items-center justify-center text-xs font-bold',
                  Number(values.escalaDolor) >= n
                    ? n <= 3 ? 'bg-success-400 text-white' : n <= 6 ? 'bg-warning-400 text-white' : 'bg-danger-500 text-white'
                    : 'bg-gray-100 text-gray-400',
                )}
              >
                {n}
              </div>
            ))}
          </div>
          <p className={clsx('text-xs font-medium mt-2', {
            'text-success-600': Number(values.escalaDolor) <= 3,
            'text-warning-600': Number(values.escalaDolor) > 3 && Number(values.escalaDolor) <= 6,
            'text-danger-600': Number(values.escalaDolor) > 6,
          })}>
            {Number(values.escalaDolor) === 0 ? 'Sin dolor' :
             Number(values.escalaDolor) <= 3 ? 'Dolor leve' :
             Number(values.escalaDolor) <= 6 ? 'Dolor moderado' : 'Dolor intenso — manejo prioritario'}
          </p>
        </div>
      )}
    </div>
  );
}
