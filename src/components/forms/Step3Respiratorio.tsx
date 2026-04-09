'use client';
import { useFormContext } from 'react-hook-form';
import type { NuevaValoracionForm } from '@/app/(dashboard)/valoracion/nueva/page';

const TIPOS_O2 = [
  'Puntas nasales', 'Mascarilla simple', 'Mascarilla con reservorio',
  'Mascarilla Venturi', 'Alto flujo (VAFO/Optiflow)', 'CPAP no invasivo',
  'BiPAP / VNI', 'Ventilación mecánica invasiva (VMI)', 'Traqueostomía con VM',
  'Traqueostomía sin VM', 'Oxígeno en sala (ambiente)', 'Sin oxigenoterapia',
];

const MODOS_VM = [
  'VCV (Volumen Controlado)', 'PCV (Presión Controlada)', 'SIMV',
  'PSV (Presión de soporte)', 'PRVC', 'APRV', 'CPAP', 'Otro',
];

const TIPOS_SECRECIONES = [
  'Escasas blanquecinas', 'Moderadas blanquecinas', 'Abundantes blanquecinas',
  'Amarillentas', 'Verdosas', 'Hemáticas/hemoptoicas', 'Espumosas', 'Sin secreciones',
];

export default function Step3Respiratorio() {
  const { register, watch } = useFormContext<NuevaValoracionForm>();
  const vm = watch('ventilacionMecanica');
  const fio2 = watch('fio2');
  const presionPlateau = watch('presionPlateau');
  const presionPico = watch('presionPico');

  return (
    <div className="form-section">
      <h3 className="form-section-title">Paso 3 — Evaluación respiratoria y ventilación mecánica</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label-clinical">Tipo de oxigenoterapia</label>
          <select className="input-clinical" {...register('tipoO2')}>
            <option value="">Seleccionar...</option>
            {TIPOS_O2.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Toggle VM */}
        <div className="sm:col-span-2">
          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <input
              type="checkbox"
              id="vm"
              className="w-4 h-4 text-clinical-500 rounded border-gray-300 focus:ring-clinical-500"
              {...register('ventilacionMecanica')}
            />
            <label htmlFor="vm" className="text-sm font-semibold text-slate-700 cursor-pointer">
              Paciente en ventilación mecánica invasiva
            </label>
          </div>
        </div>

        {/* Parámetros de VM */}
        {vm && (
          <>
            <div>
              <label className="label-clinical">Modo ventilatorio</label>
              <select className="input-clinical" {...register('modoVentilatorio')}>
                <option value="">Seleccionar modo...</option>
                {MODOS_VM.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label-clinical">FiO₂ (0.21 – 1.0)</label>
              <input type="number" step="0.01" min={0.21} max={1.0} placeholder="Ej: 0.50" className="input-clinical" {...register('fio2')} />
              {fio2 && Number(fio2) > 0.6 && (
                <p className="text-xs text-warning-600 mt-1 font-medium">⚠ FiO₂ &gt; 60% — toxicidad por O₂. Evaluar ajuste de PEEP.</p>
              )}
            </div>
            <div>
              <label className="label-clinical">PEEP (cmH₂O)</label>
              <input type="number" step="0.5" min={0} max={30} placeholder="Ej: 8" className="input-clinical" {...register('peep')} />
            </div>
            <div>
              <label className="label-clinical">Volumen tidal (mL)</label>
              <input type="number" min={0} max={1500} placeholder="Ej: 420" className="input-clinical" {...register('volumenTidal')} />
            </div>
            <div>
              <label className="label-clinical">FR programada (rpm)</label>
              <input type="number" min={0} max={60} placeholder="Ej: 18" className="input-clinical" {...register('frProgramada')} />
            </div>
            <div>
              <label className="label-clinical">Presión pico (cmH₂O)</label>
              <input type="number" min={0} max={80} placeholder="Ej: 28" className="input-clinical" {...register('presionPico')} />
              {presionPico && Number(presionPico) > 40 && (
                <p className="text-xs text-warning-600 mt-1">⚠ Ppico &gt; 40 — Evaluar causa</p>
              )}
            </div>
            <div>
              <label className="label-clinical">Presión plateau (cmH₂O)</label>
              <input type="number" min={0} max={80} placeholder="Ej: 24" className="input-clinical" {...register('presionPlateau')} />
              {presionPlateau && Number(presionPlateau) > 30 && (
                <p className="text-xs text-danger-600 mt-1 font-semibold">🔴 Pplateau &gt; 30 — Riesgo de barotrauma. Ajustar VT.</p>
              )}
              {presionPlateau && Number(presionPlateau) <= 30 && Number(presionPlateau) > 0 && (
                <p className="text-xs text-success-600 mt-1">✓ Pplateau ≤ 30 — Dentro del rango de ventilación protectora</p>
              )}
            </div>
          </>
        )}

        {/* Secreciones */}
        <div>
          <label className="label-clinical">Características de secreciones</label>
          <select className="input-clinical" {...register('secreciones')}>
            <option value="">Seleccionar...</option>
            {TIPOS_SECRECIONES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Checkboxes adicionales */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
            <input type="checkbox" id="ma" className="w-4 h-4 text-clinical-500 rounded border-gray-300" {...register('musculosAccesorios')} />
            <label htmlFor="ma" className="text-sm text-slate-700 cursor-pointer">Uso de músculos accesorios de la respiración</label>
          </div>
          {vm && (
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
              <input type="checkbox" id="sinc" className="w-4 h-4 text-clinical-500 rounded border-gray-300" defaultChecked {...register('sincroniaVentilador')} />
              <label htmlFor="sinc" className="text-sm text-slate-700 cursor-pointer">Sincronía adecuada paciente-ventilador</label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
