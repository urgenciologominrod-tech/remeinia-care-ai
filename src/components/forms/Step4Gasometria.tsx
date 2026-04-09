'use client';
import { useFormContext, useWatch } from 'react-hook-form';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import type { NuevaValoracionForm } from '@/app/(dashboard)/valoracion/nueva/page';

function getAcidBase(pH?: number, PaCO2?: number, HCO3?: number): { tipo: string; color: string } | null {
  if (!pH) return null;
  const acidosis = pH < 7.35;
  const alcalosis = pH > 7.45;
  const altCO2 = PaCO2 && (PaCO2 < 35 || PaCO2 > 45);
  const altHCO3 = HCO3 && (HCO3 < 22 || HCO3 > 26);

  if (acidosis && PaCO2 && PaCO2 > 45) return { tipo: 'Acidosis respiratoria', color: 'text-danger-600' };
  if (acidosis && HCO3 && HCO3 < 22) return { tipo: 'Acidosis metabólica', color: 'text-danger-600' };
  if (alcalosis && PaCO2 && PaCO2 < 35) return { tipo: 'Alcalosis respiratoria', color: 'text-warning-600' };
  if (alcalosis && HCO3 && HCO3 > 26) return { tipo: 'Alcalosis metabólica', color: 'text-warning-600' };
  if (pH >= 7.35 && pH <= 7.45) return { tipo: 'Equilibrio ácido-base dentro de parámetros normales', color: 'text-success-600' };
  return { tipo: 'Trastorno mixto — interpretar en contexto clínico', color: 'text-gray-600' };
}

export default function Step4Gasometria() {
  const { register } = useFormContext<NuevaValoracionForm>();
  const pH = useWatch({ name: 'gaso_pH' });
  const PaCO2 = useWatch({ name: 'gaso_PaCO2' });
  const PaO2 = useWatch({ name: 'gaso_PaO2' });
  const HCO3 = useWatch({ name: 'gaso_HCO3' });
  const fio2 = useWatch({ name: 'fio2' });

  const paFiO2Calc = PaO2 && fio2 ? Math.round(Number(PaO2) / Number(fio2)) : null;
  const acidBase = getAcidBase(Number(pH) || undefined, Number(PaCO2) || undefined, Number(HCO3) || undefined);

  const getSdraGrado = (val: number) => {
    if (val < 100) return { label: 'SDRA Grave', color: 'text-danger-700 bg-danger-50 border-danger-200' };
    if (val < 200) return { label: 'SDRA Moderado', color: 'text-danger-600 bg-danger-50 border-danger-100' };
    if (val < 300) return { label: 'SDRA Leve', color: 'text-warning-700 bg-warning-50 border-warning-200' };
    return { label: 'Sin criterio SDRA por PaFiO₂', color: 'text-success-700 bg-success-50 border-success-200' };
  };

  return (
    <div className="form-section">
      <h3 className="form-section-title">Paso 4 — Gasometría arterial</h3>
      <p className="text-xs text-gray-400 mb-5 -mt-2">
        Ingresar valores del último reporte disponible. El sistema calcula PaO₂/FiO₂ automáticamente si se ha ingresado la FiO₂ en el paso anterior.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'pH', name: 'gaso_pH', placeholder: '7.35-7.45', unit: '' },
          { label: 'PaCO₂', name: 'gaso_PaCO2', placeholder: '35-45', unit: 'mmHg' },
          { label: 'PaO₂', name: 'gaso_PaO2', placeholder: '80-100', unit: 'mmHg' },
          { label: 'HCO₃⁻', name: 'gaso_HCO3', placeholder: '22-26', unit: 'mEq/L' },
          { label: 'SaO₂', name: 'gaso_SaO2', placeholder: '95-100', unit: '%' },
          { label: 'Lactato', name: 'gaso_Lactato', placeholder: '0.5-2.0', unit: 'mmol/L' },
        ].map(c => (
          <div key={c.name} className="bg-white border border-gray-100 rounded-xl p-3.5">
            <label className="text-xs font-semibold text-slate-600 block mb-2">{c.label}</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="any"
                placeholder={c.placeholder}
                className="flex-1 px-2.5 py-2 text-base font-bold text-slate-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinical-500 bg-white"
                {...register(c.name as keyof NuevaValoracionForm)}
              />
              <span className="text-xs text-gray-400 flex-shrink-0">{c.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interpretación en tiempo real */}
      <div className="mt-5 space-y-3">
        {/* PaFiO2 calculada */}
        {paFiO2Calc && paFiO2Calc > 0 && (() => {
          const sdra = getSdraGrado(paFiO2Calc);
          return (
            <div className={clsx('border rounded-xl p-4', sdra.color)}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold">PaO₂/FiO₂ calculada automáticamente</p>
                  <p className="text-3xl font-black mt-1">{paFiO2Calc} <span className="text-base font-normal opacity-70">mmHg</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold opacity-80">Interpretación:</p>
                  <p className="text-sm font-bold">{sdra.label}</p>
                  <p className="text-xs opacity-70 mt-0.5">PaO₂ {PaO2} / FiO₂ {fio2}</p>
                </div>
              </div>
              {Number(paFiO2Calc) < 300 && (
                <p className="text-xs mt-2 opacity-80">
                  ⚠ PaFiO₂ &lt; 300 en paciente con condición clínica aguda es criterio de SDRA. Requiere verificación con la condición clínica completa del paciente.
                </p>
              )}
            </div>
          );
        })()}

        {/* Interpretación ácido-base */}
        {acidBase && (
          <div className={clsx('border rounded-xl p-4 flex items-center gap-3', {
            'bg-success-50 border-success-200': acidBase.color.includes('success'),
            'bg-danger-50 border-danger-200': acidBase.color.includes('danger'),
            'bg-warning-50 border-warning-200': acidBase.color.includes('warning'),
            'bg-gray-50 border-gray-200': acidBase.color.includes('gray'),
          })}>
            {acidBase.color.includes('success')
              ? <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
              : <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0" />
            }
            <div>
              <p className="text-xs text-gray-500">Interpretación ácido-base (orientativa):</p>
              <p className={clsx('text-sm font-semibold', acidBase.color)}>{acidBase.tipo}</p>
              <p className="text-xs text-gray-400 mt-0.5">Siempre interpretar en contexto clínico completo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
