'use client';
import { useFormContext } from 'react-hook-form';
import type { NuevaValoracionForm } from '@/app/(dashboard)/valoracion/nueva/page';

const LABS = [
  { key: 'hemoglobina', label: 'Hemoglobina', unit: 'g/dL', normal: '12-17', min: 0, max: 25 },
  { key: 'hematocrito', label: 'Hematocrito', unit: '%', normal: '35-50', min: 0, max: 80 },
  { key: 'leucocitos', label: 'Leucocitos', unit: '/mm³', normal: '4000-11000', min: 0, max: 100000 },
  { key: 'plaquetas', label: 'Plaquetas', unit: '/mm³', normal: '150k-400k', min: 0, max: 1500000 },
  { key: 'sodio', label: 'Sodio (Na⁺)', unit: 'mEq/L', normal: '135-145', min: 0, max: 200 },
  { key: 'potasio', label: 'Potasio (K⁺)', unit: 'mEq/L', normal: '3.5-5.0', min: 0, max: 10 },
  { key: 'cloro', label: 'Cloro (Cl⁻)', unit: 'mEq/L', normal: '98-106', min: 0, max: 150 },
  { key: 'calcio', label: 'Calcio total', unit: 'mg/dL', normal: '8.5-10.5', min: 0, max: 20 },
  { key: 'magnesio', label: 'Magnesio', unit: 'mg/dL', normal: '1.7-2.4', min: 0, max: 10 },
  { key: 'creatinina', label: 'Creatinina', unit: 'mg/dL', normal: '0.6-1.2', min: 0, max: 30 },
  { key: 'urea', label: 'Urea / BUN', unit: 'mg/dL', normal: '10-50', min: 0, max: 300 },
  { key: 'bilirrubina_total', label: 'Bilirrubina total', unit: 'mg/dL', normal: '0.1-1.2', min: 0, max: 50 },
  { key: 'pcr', label: 'PCR', unit: 'mg/L', normal: '<10', min: 0, max: 1000 },
  { key: 'procalcitonina', label: 'Procalcitonina', unit: 'ng/mL', normal: '<0.5', min: 0, max: 500 },
  { key: 'glucosa', label: 'Glucosa sérica', unit: 'mg/dL', normal: '70-100', min: 0, max: 800 },
  { key: 'lactato_deshidrogenasa', label: 'LDH', unit: 'U/L', normal: '140-280', min: 0, max: 5000 },
  { key: 'troponina', label: 'Troponina', unit: 'ng/mL', normal: '<0.04', min: 0, max: 50 },
  { key: 'albumina', label: 'Albúmina', unit: 'g/dL', normal: '3.5-5.0', min: 0, max: 10 },
];

export default function Step5Laboratorios() {
  const { watch, setValue } = useFormContext<NuevaValoracionForm>();
  const labs = (watch('laboratorios') as Record<string, number>) ?? {};

  const updateLab = (key: string, value: string) => {
    setValue('laboratorios', { ...labs, [key]: value === '' ? undefined : parseFloat(value) });
  };

  return (
    <div className="form-section">
      <h3 className="form-section-title">Paso 5 — Laboratorios disponibles</h3>
      <p className="text-xs text-gray-400 mb-5 -mt-2">
        Registrar solo los resultados disponibles. Los valores atípicos se marcarán automáticamente como alertas en el análisis clínico.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {LABS.map(lab => (
          <div key={lab.key} className="bg-white border border-gray-100 rounded-xl p-3">
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">{lab.label}</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="any"
                min={lab.min}
                max={lab.max}
                placeholder={lab.normal}
                value={labs[lab.key] ?? ''}
                onChange={e => updateLab(lab.key, e.target.value)}
                className="flex-1 min-w-0 px-2.5 py-2 text-sm font-medium text-slate-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinical-500"
              />
              <span className="text-xs text-gray-400 flex-shrink-0">{lab.unit}</span>
            </div>
            <p className="text-[10px] text-gray-300 mt-1">Normal: {lab.normal}</p>
          </div>
        ))}
      </div>

      {/* Alertas rápidas */}
      <div className="mt-4 space-y-2">
        {labs.potasio && Number(labs.potasio) >= 6.0 && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-xs font-semibold flex items-center gap-2">
            🔴 K⁺ = {labs.potasio} mEq/L — Hiperpotasemia grave. Riesgo de arritmias cardíacas.
          </div>
        )}
        {labs.procalcitonina && Number(labs.procalcitonina) > 2 && (
          <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg text-warning-700 text-xs font-semibold flex items-center gap-2">
            ⚠ PCT = {labs.procalcitonina} ng/mL — Elevada. Evaluar proceso infeccioso bacteriano.
          </div>
        )}
        {labs.creatinina && Number(labs.creatinina) > 2.0 && (
          <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg text-warning-700 text-xs font-semibold flex items-center gap-2">
            ⚠ Creatinina = {labs.creatinina} mg/dL — Disfunción renal. Ajustar medicamentos nefrotóxicos.
          </div>
        )}
        {labs.glucosa && Number(labs.glucosa) > 250 && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-xs font-semibold flex items-center gap-2">
            🔴 Glucosa = {labs.glucosa} mg/dL — Hiperglucemia grave. Evaluar protocolo de insulina.
          </div>
        )}
      </div>
    </div>
  );
}
