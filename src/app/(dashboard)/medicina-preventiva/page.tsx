'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Award, BarChart3, FileImage, RotateCcw, Video } from 'lucide-react';
import jsPDF from 'jspdf';

interface Pregunta {
  id: number;
  texto: string;
  opciones: string[];
  correcta: number;
  competencia: 'Promoción de la salud' | 'Detección oportuna' | 'Educación al paciente' | 'Normatividad ISSSTE' | 'Seguimiento clínico';
}

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuál es el objetivo principal de la medicina preventiva en primer nivel?',
    opciones: ['Tratar complicaciones avanzadas', 'Reducir riesgos y prevenir enfermedad antes de su aparición', 'Sustituir todas las consultas especializadas'],
    correcta: 1,
    competencia: 'Promoción de la salud',
  },
  {
    id: 2,
    texto: '¿Qué acción corresponde a detección oportuna?',
    opciones: ['Suspender controles en pacientes asintomáticos', 'Aplicar tamizajes según grupo etario y factores de riesgo', 'Referir a todos los pacientes a urgencias'],
    correcta: 1,
    competencia: 'Detección oportuna',
  },
  {
    id: 3,
    texto: 'En educación al paciente, ¿qué práctica es correcta?',
    opciones: ['Entregar información sin verificar comprensión', 'Usar lenguaje claro y confirmar entendimiento', 'Evitar involucrar a familiares o cuidadores'],
    correcta: 1,
    competencia: 'Educación al paciente',
  },
  {
    id: 4,
    texto: '¿Qué elemento es indispensable para cumplimiento normativo ISSSTE?',
    opciones: ['Registro clínico y trazabilidad de las intervenciones', 'Solo comunicación verbal del plan preventivo', 'No registrar datos para agilizar consulta'],
    correcta: 0,
    competencia: 'Normatividad ISSSTE',
  },
  {
    id: 5,
    texto: 'Para seguimiento clínico en prevención, lo más adecuado es:',
    opciones: ['Dar de alta permanente tras una sola sesión', 'Programar revaloración y monitorear adherencia', 'Esperar síntomas para retomar contacto'],
    correcta: 1,
    competencia: 'Seguimiento clínico',
  },
];

const CALIFICACION_MINIMA = 80;

export default function MedicinaPreventivaPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videos, setVideos] = useState<string[]>([
    'https://www.youtube.com/embed/5qap5aO4i9A',
  ]);
  const [infografias, setInfografias] = useState<File[]>([]);
  const [nombreParticipante, setNombreParticipante] = useState('');
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [evaluacionIntentada, setEvaluacionIntentada] = useState(false);

  const totalCorrectas = useMemo(
    () => PREGUNTAS.reduce((acc, pregunta) => acc + (respuestas[pregunta.id] === pregunta.correcta ? 1 : 0), 0),
    [respuestas],
  );

  const porcentaje = Math.round((totalCorrectas / PREGUNTAS.length) * 100);
  const acreditado = porcentaje >= CALIFICACION_MINIMA;

  const competencias = useMemo(() => {
    const base = {
      'Promoción de la salud': 0,
      'Detección oportuna': 0,
      'Educación al paciente': 0,
      'Normatividad ISSSTE': 0,
      'Seguimiento clínico': 0,
    } as Record<Pregunta['competencia'], number>;

    PREGUNTAS.forEach((pregunta) => {
      if (respuestas[pregunta.id] === pregunta.correcta) {
        base[pregunta.competencia] = 100;
      }
    });

    return Object.entries(base);
  }, [respuestas]);

  const agregarVideo = (event: FormEvent) => {
    event.preventDefault();
    if (!videoUrl.trim()) return;

    const urlNormalizada = videoUrl.includes('watch?v=')
      ? videoUrl.replace('watch?v=', 'embed/')
      : videoUrl;

    setVideos((prev) => [urlNormalizada, ...prev]);
    setVideoUrl('');
  };

  const subirInfografias = (files: FileList | null) => {
    if (!files) return;
    setInfografias((prev) => [...Array.from(files), ...prev]);
  };

  const enviarEvaluacion = (event: FormEvent) => {
    event.preventDefault();
    setEvaluacionIntentada(true);
  };

  const reiniciarCurso = () => {
    setRespuestas({});
    setEvaluacionIntentada(false);
  };

  const generarConstancia = () => {
    if (!acreditado || !nombreParticipante.trim()) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Constancia de acreditación', 105, 30, { align: 'center' });

    doc.setFontSize(12);
    doc.text('Hospital Regional General Ignacio Zaragoza del ISSSTE', 105, 45, { align: 'center' });
    doc.text(`Se otorga la presente constancia a: ${nombreParticipante}`, 20, 70);
    doc.text('Por acreditar el curso de Medicina Preventiva.', 20, 80);
    doc.text(`Calificación obtenida: ${porcentaje}%`, 20, 90);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 20, 100);

    doc.save(`constancia-${nombreParticipante.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Medicina Preventiva</h1>
        <p className="text-sm text-gray-500 mt-1">Hospital Regional General Ignacio Zaragoza del ISSSTE</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card-clinical space-y-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-clinical-600" />
            <h2 className="text-lg font-semibold text-slate-800">Biblioteca de videos</h2>
          </div>

          <form className="flex gap-2" onSubmit={agregarVideo}>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Pega una URL de YouTube o video embebido"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="btn-primary">Agregar</button>
          </form>

          <div className="space-y-3">
            {videos.map((video, index) => (
              <iframe
                key={`${video}-${index}`}
                className="w-full aspect-video rounded-lg border border-gray-200"
                src={video}
                title={`Video preventivo ${index + 1}`}
                allowFullScreen
              />
            ))}
          </div>
        </article>

        <article className="card-clinical space-y-4">
          <div className="flex items-center gap-2">
            <FileImage className="w-5 h-5 text-clinical-600" />
            <h2 className="text-lg font-semibold text-slate-800">Infografías del curso</h2>
          </div>

          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={(e) => subirInfografias(e.target.files)}
            className="block w-full text-sm text-gray-600"
          />

          <ul className="space-y-2 text-sm">
            {infografias.length === 0 ? (
              <li className="text-gray-500">Sin infografías cargadas todavía.</li>
            ) : (
              infografias.map((archivo, index) => (
                <li key={`${archivo.name}-${index}`} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                  {archivo.name}
                </li>
              ))
            )}
          </ul>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="card-clinical lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-clinical-600" />
            <h2 className="text-lg font-semibold text-slate-800">Evaluación de acreditación</h2>
          </div>

          <form className="space-y-5" onSubmit={enviarEvaluacion}>
            {PREGUNTAS.map((pregunta) => (
              <fieldset key={pregunta.id} className="space-y-2">
                <legend className="font-medium text-slate-700">{pregunta.id}. {pregunta.texto}</legend>
                {pregunta.opciones.map((opcion, index) => (
                  <label key={opcion} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name={`pregunta-${pregunta.id}`}
                      checked={respuestas[pregunta.id] === index}
                      onChange={() => setRespuestas((prev) => ({ ...prev, [pregunta.id]: index }))}
                    />
                    {opcion}
                  </label>
                ))}
              </fieldset>
            ))}

            <div className="flex flex-wrap gap-2">
              <button type="submit" className="btn-primary">Calificar</button>
              <button type="button" className="btn-secondary" onClick={reiniciarCurso}>
                <RotateCcw className="w-4 h-4" />
                Repetir curso
              </button>
            </div>
          </form>

          {evaluacionIntentada && (
            <div className={`mt-5 rounded-lg border px-4 py-3 text-sm ${acreditado ? 'border-success-300 bg-success-50 text-success-700' : 'border-danger-300 bg-danger-50 text-danger-700'}`}>
              Resultado: <strong>{porcentaje}%</strong> ({totalCorrectas}/{PREGUNTAS.length} respuestas correctas).{' '}
              {acreditado ? 'Acreditado. Puede generar su constancia.' : 'No acreditado. Debe tomar nuevamente el curso.'}
            </div>
          )}

          {evaluacionIntentada && acreditado && (
            <div className="mt-4 rounded-lg border border-gray-200 p-4 space-y-3">
              <label className="text-sm font-medium text-slate-700 block">Nombre completo para constancia</label>
              <input
                value={nombreParticipante}
                onChange={(e) => setNombreParticipante(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Ej. María Fernanda López García"
              />
              <button type="button" className="btn-primary" onClick={generarConstancia}>
                Generar constancia PDF
              </button>
            </div>
          )}
        </article>

        <article className="card-clinical space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-clinical-600" />
            <h2 className="text-lg font-semibold text-slate-800">Valoración de competencias</h2>
          </div>

          <div className="space-y-3">
            {competencias.map(([competencia, valor]) => (
              <div key={competencia}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{competencia}</span>
                  <span className="font-medium text-slate-800">{valor}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-2 rounded-full bg-clinical-500" style={{ width: `${valor}%` }} />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            La gráfica se actualiza conforme responde la evaluación para identificar fortalezas y áreas de mejora.
          </p>
        </article>
      </section>
    </div>
  );
}
