'use client';
import { useFormContext } from 'react-hook-form';
import type { NuevaValoracionForm } from '@/app/(dashboard)/valoracion/nueva/page';

const SERVICIOS = [
  'UCI Adultos', 'UCI Pediátrica', 'Urgencias Adultos', 'Urgencias Pediátricas',
  'Hospitalización General', 'Cirugía General', 'Cardiología', 'Neumología',
  'Neurología', 'Oncología', 'Nefrología', 'Ginecología', 'Obstetricia',
  'Trauma / Ortopedia', 'Neonatología', 'Otro',
];

export default function Step1Identificacion() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<NuevaValoracionForm>();
  const comorbilidades = watch('comorbilidades') ?? [];

  const comorbilidadesComunes = [
    'Diabetes mellitus tipo 2', 'Hipertensión arterial sistémica', 'Insuficiencia renal crónica',
    'EPOC', 'Asma', 'Cardiopatía isquémica', 'Insuficiencia cardíaca', 'Obesidad',
    'Cirrosis hepática', 'VIH', 'Cáncer activo', 'Inmunosupresión', 'Coagulopatía',
  ];

  const toggleComorbilidad = (c: string) => {
    if (comorbilidades.includes(c)) {
      setValue('comorbilidades', comorbilidades.filter(x => x !== c));
    } else {
      setValue('comorbilidades', [...comorbilidades, c]);
    }
  };

  return (
    <div className="form-section">
      <h3 className="form-section-title">Paso 1 — Identificación clínica</h3>
      <p className="text-xs text-gray-400 mb-5 -mt-2">
        Usar iniciales o identificador anónimo. No registrar nombre completo en este campo por privacidad.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-clinical">Iniciales o identificador *</label>
          <input className="input-clinical" placeholder="Ej: J.M.L." {...register('inicialesPaciente')} />
          {errors.inicialesPaciente && <p className="mt-1 text-xs text-danger-600">{errors.inicialesPaciente.message}</p>}
          <p className="text-xs text-gray-400 mt-1">No usar nombre completo — política de privacidad</p>
        </div>

        <div>
          <label className="label-clinical">Servicio / Área *</label>
          <select className="input-clinical" {...register('servicio')}>
            <option value="">Seleccionar servicio...</option>
            {SERVICIOS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.servicio && <p className="mt-1 text-xs text-danger-600">{errors.servicio.message}</p>}
        </div>

        <div>
          <label className="label-clinical">Edad (años) *</label>
          <input type="number" min={0} max={130} className="input-clinical" placeholder="Ej: 58" {...register('edad')} />
          {errors.edad && <p className="mt-1 text-xs text-danger-600">{errors.edad.message}</p>}
        </div>

        <div>
          <label className="label-clinical">Sexo biológico *</label>
          <select className="input-clinical" {...register('sexo')}>
            <option value="NO_ESPECIFICADO">No especificado</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMENINO">Femenino</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        <div>
          <label className="label-clinical">Cama / Cubículo</label>
          <input className="input-clinical" placeholder="Ej: UCI-04" {...register('cama')} />
        </div>

        <div className="sm:col-span-2">
          <label className="label-clinical">Diagnóstico médico principal *</label>
          <input
            className="input-clinical"
            placeholder="Ej: Neumonía bilateral grave / SDRA moderado"
            {...register('diagnosticoMedico')}
          />
          {errors.diagnosticoMedico && <p className="mt-1 text-xs text-danger-600">{errors.diagnosticoMedico.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="label-clinical">Motivo de atención / consulta *</label>
          <textarea
            className="input-clinical resize-none"
            rows={3}
            placeholder="Describir brevemente el motivo de atención de enfermería..."
            {...register('motivoAtencion')}
          />
          {errors.motivoAtencion && <p className="mt-1 text-xs text-danger-600">{errors.motivoAtencion.message}</p>}
        </div>
      </div>

      {/* Comorbilidades */}
      <div className="mt-5">
        <label className="label-clinical mb-3 block">Comorbilidades / Antecedentes relevantes</label>
        <div className="flex flex-wrap gap-2">
          {comorbilidadesComunes.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => toggleComorbilidad(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                comorbilidades.includes(c)
                  ? 'bg-clinical-500 text-white border-clinical-500'
                  : 'bg-white text-slate-600 border-gray-200 hover:border-clinical-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {comorbilidades.length > 0 && (
          <p className="text-xs text-clinical-600 mt-2">Seleccionadas: {comorbilidades.join(', ')}</p>
        )}
      </div>
    </div>
  );
}
