'use client';
import { useFormContext } from 'react-hook-form';
import { Info } from 'lucide-react';
import type { NuevaValoracionForm } from '@/app/(dashboard)/valoracion/nueva/page';

export default function Step8Observaciones() {
  const { register } = useFormContext<NuevaValoracionForm>();

  return (
    <div className="form-section">
      <h3 className="form-section-title">Paso 8 — Observaciones y prioridades</h3>

      <div className="bg-clinical-50 border border-clinical-100 rounded-xl p-4 mb-5 flex items-start gap-3">
        <Info className="w-4 h-4 text-clinical-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-clinical-700">Último paso antes de generar el plan</p>
          <p className="text-xs text-clinical-600 mt-1">
            El juicio clínico de enfermería es fundamental. Documenta aquí tus observaciones narrativas
            y las prioridades que identificas desde tu evaluación directa del paciente. El motor de análisis
            tomará en cuenta estas notas.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="label-clinical">Resumen narrativo de evolución clínica</label>
          <textarea
            rows={5}
            className="input-clinical resize-y"
            placeholder="Describir libremente la evolución del paciente durante tu turno o contacto. Incluir cambios observados, respuesta a tratamientos, evolución general..."
            {...register('observaciones')}
          />
        </div>

        <div>
          <label className="label-clinical">Prioridades identificadas por enfermería</label>
          <textarea
            rows={4}
            className="input-clinical resize-y"
            placeholder="¿Qué consideras prioritario atender en este paciente durante las próximas horas? ¿Hay algo que te preocupa especialmente? Este campo complementa el análisis automático con tu criterio clínico."
            {...register('prioridadesPercibidas')}
          />
        </div>

        {/* Aviso final */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">⚠ Antes de generar el plan</p>
          <ul className="text-xs text-amber-700 space-y-1.5 list-disc list-inside">
            <li>El plan generado contiene <strong>sugerencias de apoyo clínico</strong>, no prescripciones.</li>
            <li>Cada diagnóstico, resultado e intervención debe ser <strong>evaluado y validado</strong> por ti.</li>
            <li>Los catálogos demostrativos están marcados con <strong>[DEMO]</strong>. Para uso clínico real, usar catálogos licenciados.</li>
            <li>Las referencias bibliográficas marcadas como <strong>[DATO DEMO]</strong> son ficticias.</li>
            <li>Puedes <strong>editar el plan</strong> antes de guardarlo o exportarlo.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
