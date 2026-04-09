'use client';
import { useFormContext } from 'react-hook-form';
import type { NuevaValoracionForm } from '@/app/(dashboard)/valoracion/nueva/page';

const SISTEMAS = [
  { key: 'neurologico', label: 'Neurológico', placeholder: 'Ej: Glasgow 14, orientado en persona y lugar, pupilas isocóricas normoreactivas, sin focalidades neurológicas...' },
  { key: 'respiratorio', label: 'Respiratorio', placeholder: 'Ej: Patrón respiratorio normal, murmullo vesicular presente bilateral, sin agregados...' },
  { key: 'cardiovascular', label: 'Cardiovascular', placeholder: 'Ej: Ritmo sinusal, FC 80 lpm, TA 120/80, llenado capilar < 2 seg, sin arritmias...' },
  { key: 'renal', label: 'Renal / Urinario', placeholder: 'Ej: Diuresis conservada 1 mL/kg/hr, sin edemas, orina amarilla clara...' },
  { key: 'gastrointestinal', label: 'Gastrointestinal', placeholder: 'Ej: Abdomen blando, sin dolor, peristaltismo presente, tolerando vía oral...' },
  { key: 'tegumentario', label: 'Tegumentario / Piel', placeholder: 'Ej: Piel integra, hidratada, sin lesiones activas. Herida quirúrgica limpia sin signos de infección...' },
  { key: 'dolor', label: 'Dolor', placeholder: 'Ej: EVA 3/10 en reposo, 5/10 al movimiento. Manejo con AINE programado...' },
  { key: 'movilidad', label: 'Movilidad / Musculoesquelético', placeholder: 'Ej: Encamado, cambios posturales cada 2 horas. Plan de movilización precoz...' },
  { key: 'nutricion', label: 'Nutrición / Metabólico', placeholder: 'Ej: Dieta blanda con adecuada tolerancia, glucosa controlada, sin pérdida de peso reciente...' },
  { key: 'riesgo_infeccion', label: 'Riesgo de infección', placeholder: 'Ej: CVC día 2, catéter urinario día 1. Aplicando bundle de prevención IAAS. Sin signos de infección activos...' },
  { key: 'riesgo_upp', label: 'Riesgo de lesiones por presión', placeholder: 'Ej: Braden 14 — riesgo moderado. Cambios posturales, colchón de espuma viscoelástica...' },
  { key: 'riesgo_caidas', label: 'Riesgo de caídas', placeholder: 'Ej: Downton 3 — riesgo moderado. Barandales elevados, cama en posición baja, orientación al paciente...' },
  { key: 'ansiedad_familia', label: 'Psicosocial / Familia / Ansiedad', placeholder: 'Ej: Paciente ansioso por diagnóstico. Familia presente y participativa. Informados sobre condición actual...' },
];

export default function Step6Sistemas() {
  const { watch, setValue } = useFormContext<NuevaValoracionForm>();
  const sistemas = (watch('valoracionSistemas') as Record<string, string>) ?? {};

  return (
    <div className="form-section">
      <h3 className="form-section-title">Paso 6 — Valoración clínica por sistemas</h3>
      <p className="text-xs text-gray-400 mb-5 -mt-2">
        Registrar los hallazgos de exploración física y valoración enfermera por sistema. A mayor detalle, mayor precisión en las sugerencias del plan de cuidados.
      </p>

      <div className="space-y-4">
        {SISTEMAS.map(s => (
          <div key={s.key}>
            <label className="label-clinical">{s.label}</label>
            <textarea
              rows={2}
              placeholder={s.placeholder}
              className="input-clinical resize-y"
              value={sistemas[s.key] ?? ''}
              onChange={e => setValue('valoracionSistemas', { ...sistemas, [s.key]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
