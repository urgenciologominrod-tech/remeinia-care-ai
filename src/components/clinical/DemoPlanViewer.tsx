'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Activity, Clipboard, FileText, Stethoscope } from 'lucide-react';

type DemoPlanState = {
  id: string;
  plan: any;
  estadoPaciente: string;
  alertas: any[];
  generadoEn: string;
};

export default function DemoPlanViewer() {
  const [data, setData] = useState<DemoPlanState | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('remeinia_demo_plan');
    if (!raw) return;
    try {
      setData(JSON.parse(raw));
    } catch {
      setData(null);
    }
  }, []);

  const diagnosticos = useMemo(() => data?.plan?.diagnosticos ?? [], [data]);
  const resultados = useMemo(() => data?.plan?.resultados ?? [], [data]);
  const intervenciones = useMemo(() => data?.plan?.intervenciones ?? [], [data]);

  if (!data) {
    return (
      <div className="card-clinical space-y-3">
        <p className="text-sm text-gray-600">No se encontró una valoración académica reciente para visualizar.</p>
        <Link href="/valoracion/nueva" className="btn-primary w-fit">Nueva valoración</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 md:pb-6 max-w-5xl mx-auto">
      <div className="card-clinical space-y-2">
        <h1 className="text-xl font-bold text-slate-800">Plan Académico de Cuidados</h1>
        <p className="text-sm text-gray-600">Resumen clínico: {data.plan.resumenPaciente}</p>
        <p className="text-sm"><strong>Clasificación de gravedad:</strong> {data.estadoPaciente}</p>
        <p className="text-xs text-clinical-700">Contenido demostrativo para apoyo académico y clínico. Requiere validación profesional.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="card-clinical">
          <h2 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><Stethoscope className="w-4 h-4" /> Diagnósticos sugeridos</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            {diagnosticos.map((dx: any) => (
              <li key={dx.codigo}><strong>{dx.etiqueta}</strong><br />{dx.justificacion}</li>
            ))}
          </ul>
        </section>

        <section className="card-clinical">
          <h2 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><Clipboard className="w-4 h-4" /> Resultados esperados tipo NOC</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            {resultados.map((item: any) => (
              <li key={item.codigo}><strong>{item.etiqueta}</strong> — {item.metaEsperada}</li>
            ))}
          </ul>
        </section>

        <section className="card-clinical">
          <h2 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><Activity className="w-4 h-4" /> Intervenciones tipo NIC y actividades</h2>
          <ul className="space-y-3 text-sm text-slate-700">
            {intervenciones.map((it: any) => (
              <li key={it.codigo}>
                <strong>{it.etiqueta}</strong>
                <ul className="list-disc ml-5 mt-1">
                  {(it.actividades ?? []).map((a: string, i: number) => <li key={i}>{a}</li>)}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-clinical">
          <h2 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Criterios de evaluación y justificación clínica</h2>
          <ul className="space-y-3 text-sm text-slate-700">
            {diagnosticos.map((dx: any) => (
              <li key={`eval-${dx.codigo}`}>
                <strong>{dx.etiqueta}</strong>
                <ul className="list-disc ml-5 mt-1">
                  {(dx.criteriosEvaluacion ?? []).map((c: string, i: number) => <li key={i}>{c}</li>)}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {data.alertas?.length > 0 && (
        <div className="card-clinical">
          <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Alertas clínicas</h3>
          <ul className="list-disc ml-5 text-sm text-slate-700">
            {data.alertas.map((a: any, i: number) => <li key={i}>{a.mensaje}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
