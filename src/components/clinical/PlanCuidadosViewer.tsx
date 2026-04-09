'use client';
// ============================================================
// REMEINIA Care AI — Visor del Plan de Cuidados
// La pantalla principal de salida clínica
// ============================================================
import { useState } from 'react';
import { clsx } from 'clsx';
import {
  AlertTriangle, Download, Save, Shield, CheckCircle,
  ChevronDown, ChevronUp, BookOpen, Activity, Info,
  Clock, User, Clipboard, Stethoscope, FlaskConical,
} from 'lucide-react';
import type { PlanCuidadosCompleto, DiagnosticoEnfermeriaSugerido } from '@/types/clinical';
import {
  COLORES_ESTADO, COLORES_PRIORIDAD, COLORES_CONFIANZA, LABELS_EVIDENCIA,
} from '@/types/clinical';
import { generarPDFPlan } from '@/lib/pdf-generator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  valoracion: any;
  plan: any;
  usuario: { nombre: string; apellidos: string; cedula?: string; servicio?: string };
  currentUserId: string;
}

export default function PlanCuidadosViewer({ valoracion, plan, usuario, currentUserId }: Props) {
  const contenido: PlanCuidadosCompleto = plan.contenido;
  const [tab, setTab] = useState<'resumen' | 'diagnosticos' | 'prioridades' | 'guias' | 'academico'>('resumen');
  const [expandedDx, setExpandedDx] = useState<Set<string>>(new Set([contenido.diagnosticos[0]?.codigo]));
  const [notasEnfermero, setNotasEnfermero] = useState<string>(plan.notasEnfermero ?? '');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const estadoColors = COLORES_ESTADO[valoracion.estadoPaciente as keyof typeof COLORES_ESTADO];

  const toggleDx = (codigo: string) => {
    const next = new Set(expandedDx);
    if (next.has(codigo)) next.delete(codigo);
    else next.add(codigo);
    setExpandedDx(next);
  };

  const handleExportPDF = async () => {
    await generarPDFPlan(contenido, {
      iniciales: valoracion.inicialesPaciente,
      edad: valoracion.edad,
      servicio: valoracion.servicio,
      diagnosticoMedico: valoracion.diagnosticoMedico,
      folio: valoracion.folio,
      enfermero: `${usuario.nombre} ${usuario.apellidos}`,
      fecha: format(new Date(valoracion.fechaHora), "dd/MM/yyyy HH:mm", { locale: es }),
    });
  };

  const handleGuardarNotas = async () => {
    setGuardando(true);
    await fetch(`/api/plan-cuidados/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notasEnfermero }),
    });
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const tabs = [
    { key: 'resumen', label: 'Resumen', icon: Clipboard },
    { key: 'diagnosticos', label: `Diagnósticos (${contenido.diagnosticos.length})`, icon: Stethoscope },
    { key: 'prioridades', label: 'Prioridades', icon: Activity },
    { key: 'guias', label: 'Evidencia', icon: BookOpen },
    { key: 'academico', label: 'REMEINIA', icon: Shield },
  ];

  return (
    <div className="space-y-5 pb-24 md:pb-6 max-w-4xl mx-auto">
      {/* Encabezado del plan */}
      <div className="card-clinical">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-800">Plan Personalizado de Cuidados</h1>
              {valoracion.esDemo && <span className="badge-demo">Paciente Demo</span>}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Folio: <strong>{valoracion.folio}</strong> · {valoracion.servicio} · {valoracion.edad} años ·{' '}
              {format(new Date(valoracion.fechaHora), "dd 'de' MMMM yyyy, HH:mm", { locale: es })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Elaboró: {usuario.nombre} {usuario.apellidos}{usuario.cedula ? ` (Cédula: ${usuario.cedula})` : ''}
            </p>
          </div>

          {/* Estado del paciente */}
          <div className={clsx(
            'flex items-center gap-2.5 px-4 py-3 rounded-xl border',
            estadoColors.bg, estadoColors.border,
          )}>
            <span className={clsx('w-3 h-3 rounded-full flex-shrink-0', {
              'bg-danger-500 animate-pulse': valoracion.estadoPaciente === 'CRITICO',
              'bg-warning-500': valoracion.estadoPaciente === 'VIGILANCIA',
              'bg-success-500': valoracion.estadoPaciente === 'ESTABLE',
              'bg-gray-400': valoracion.estadoPaciente === 'DESCONOCIDO',
            })} />
            <div>
              <p className={clsx('text-xs font-medium', estadoColors.text)}>Estado clínico</p>
              <p className={clsx('text-sm font-bold', estadoColors.text)}>{estadoColors.label}</p>
            </div>
          </div>
        </div>

        {/* Aviso herramienta */}
        <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Herramienta de apoyo a la decisión clínica.</strong> Este plan contiene sugerencias generadas por análisis de datos.
            No sustituye el juicio clínico profesional. Cada recomendación debe ser evaluada, modificada o rechazada
            por el profesional de enfermería responsable. Aval académico: <strong>REMEINIA</strong>.
          </p>
        </div>

        {/* Alertas críticas */}
        {(valoracion.alertasActivas as any[]).filter(a => a.tipo === 'critica').length > 0 && (
          <div className="mt-4 space-y-2">
            {(valoracion.alertasActivas as any[]).filter(a => a.tipo === 'critica').map((a: any, i: number) => (
              <div key={i} className="alerta-critica text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{a.mensaje}</span>
              </div>
            ))}
          </div>
        )}

        {/* Botones acción */}
        <div className="mt-4 flex gap-3 flex-wrap">
          <button onClick={handleExportPDF} className="btn-secondary text-sm">
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
          <button
            onClick={handleGuardarNotas}
            disabled={guardando}
            className={clsx('btn-secondary text-sm', guardado && 'border-success-300 text-success-700')}
          >
            {guardado ? <><CheckCircle className="w-4 h-4" /> Guardado</> : <><Save className="w-4 h-4" /> {guardando ? 'Guardando...' : 'Guardar notas'}</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 flex-1 justify-center',
                tab === t.key
                  ? 'border-clinical-500 text-clinical-600 bg-clinical-50/50'
                  : 'border-transparent text-gray-500 hover:text-slate-700 hover:bg-gray-50/50',
              )}
            >
              <t.icon className="w-3.5 h-3.5 hidden sm:block" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 animate-fade-in">
          {/* ── TAB: Resumen ─────────────────────────────── */}
          {tab === 'resumen' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Resumen del paciente</h3>
                <p className="text-sm text-slate-600 leading-relaxed bg-gray-50 rounded-lg p-4">{contenido.resumenPaciente}</p>
              </div>

              {contenido.explicacionDiagnostico && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-clinical-500" />
                    Explicación del diagnóstico médico (para enfermería)
                  </h3>
                  <div className="bg-clinical-50 border border-clinical-100 rounded-lg p-4">
                    <p className="text-sm text-clinical-800 leading-relaxed">{contenido.explicacionDiagnostico}</p>
                  </div>
                </div>
              )}

              {/* Alertas de advertencia */}
              {(valoracion.alertasActivas as any[]).filter((a: any) => a.tipo === 'advertencia').length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Precauciones y vigilancia</h3>
                  <div className="space-y-2">
                    {(valoracion.alertasActivas as any[]).filter((a: any) => a.tipo === 'advertencia').map((a: any, i: number) => (
                      <div key={i} className="alerta-advertencia text-sm">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-warning-500" />
                        {a.mensaje}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas del enfermero */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Notas del profesional de enfermería (editables)</h3>
                <textarea
                  rows={4}
                  value={notasEnfermero}
                  onChange={e => setNotasEnfermero(e.target.value)}
                  className="input-clinical resize-y"
                  placeholder="Escribe aquí tus notas, modificaciones al plan, observaciones adicionales o aclaraciones..."
                />
              </div>
            </div>
          )}

          {/* ── TAB: Diagnósticos ────────────────────────── */}
          {tab === 'diagnosticos' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500">
                  Los diagnósticos, resultados e intervenciones marcados con [DEMO] son demostrativos.
                  Para uso clínico real, el administrador debe cargar catálogos con licencia apropiada.
                  Los niveles de confianza indican la solidez de los datos que respaldan la sugerencia.
                </p>
              </div>

              {contenido.diagnosticos.map((dx) => {
                const prioColors = COLORES_PRIORIDAD[dx.prioridad];
                const confColors = COLORES_CONFIANZA[dx.confianza];
                const expanded = expandedDx.has(dx.codigo);
                const noc = contenido.resultados?.find(r => r.relacionadoCon === dx.codigo);
                const nics = contenido.intervenciones?.filter(i => i.relacionadaCon === dx.codigo) ?? [];

                return (
                  <div key={dx.codigo} className="border border-gray-100 rounded-xl overflow-hidden">
                    {/* Header del diagnóstico */}
                    <button
                      type="button"
                      onClick={() => toggleDx(dx.codigo)}
                      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className={clsx('w-1 rounded-full self-stretch min-h-[40px]', prioColors.dot)} />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', prioColors.bg, prioColors.text)}>
                              {prioColors.label}
                            </span>
                            <span className={clsx('text-xs font-medium', confColors.text)}>
                              Confianza: {confColors.label}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-800 mt-1.5">{dx.etiqueta}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Código: {dx.codigo}</p>
                        </div>
                      </div>
                      {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    </button>

                    {/* Contenido expandido */}
                    {expanded && (
                      <div className="border-t border-gray-50 divide-y divide-gray-50">
                        {/* Factores y manifestaciones */}
                        <div className="p-4 bg-gray-50/50 grid sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              {dx.factoresRelacionados?.length ? 'Factores relacionados' : 'Factores de riesgo'}
                            </p>
                            <ul className="space-y-1">
                              {(dx.factoresRelacionados ?? dx.factoresRiesgo ?? []).map((f, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-1.5">
                                  <span className="text-clinical-400 mt-1">•</span> {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Manifestaciones encontradas</p>
                            <ul className="space-y-1">
                              {(dx.manifestacionesClave ?? []).map((m, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-1.5">
                                  <span className="text-warning-400 mt-1">•</span> {m}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Justificación */}
                        <div className="p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Justificación clínica</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{dx.justificacion}</p>
                        </div>

                        {/* NOC */}
                        {noc && (
                          <div className="p-4 bg-accent-50/30">
                            <p className="text-xs font-semibold text-accent-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" /> Resultado esperado (NOC-like · Demo)
                            </p>
                            <p className="text-sm font-semibold text-slate-700">{noc.etiqueta}</p>
                            <p className="text-xs text-gray-500 mt-0.5 italic">{noc.metaEsperada}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {noc.indicadores.map((ind, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 bg-accent-100 text-accent-700 rounded-full">{ind}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* NICs */}
                        {nics.length > 0 && nics.map(nic => (
                          <div key={nic.codigo} className="p-4">
                            <p className="text-xs font-semibold text-clinical-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5" /> Intervención (NIC-like · Demo): {nic.etiqueta}
                            </p>
                            {nic.frecuencia && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mb-2 inline-block">
                                ⏱ Frecuencia: {nic.frecuencia}
                              </span>
                            )}
                            <ul className="space-y-1.5 mt-2">
                              {nic.actividades.map((act, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                  <span className="flex-shrink-0 w-5 h-5 bg-clinical-100 text-clinical-600 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                  {act}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── TAB: Prioridades ─────────────────────────── */}
          {tab === 'prioridades' && (
            <div className="space-y-5">
              {[
                { label: 'Prioridad inmediata', subtitle: '< 1 hora — atención urgente', items: contenido.prioridadesInmediatas, color: 'bg-danger-500', bg: 'bg-danger-50', border: 'border-danger-100', text: 'text-danger-800' },
                { label: 'Prioridad intermedia', subtitle: 'Dentro del turno actual', items: contenido.prioridadesIntermedias, color: 'bg-warning-500', bg: 'bg-warning-50', border: 'border-warning-100', text: 'text-warning-800' },
                { label: 'Vigilancia continua', subtitle: 'Monitoreo y evaluación constante', items: contenido.vigilanciaContinua, color: 'bg-clinical-500', bg: 'bg-clinical-50', border: 'border-clinical-100', text: 'text-clinical-800' },
              ].map(grupo => grupo.items.length > 0 && (
                <div key={grupo.label} className={clsx('rounded-xl border p-4', grupo.bg, grupo.border)}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={clsx('w-3 h-3 rounded-full', grupo.color)} />
                    <div>
                      <p className={clsx('text-sm font-bold', grupo.text)}>{grupo.label}</p>
                      <p className="text-xs text-gray-400">{grupo.subtitle}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {grupo.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className={clsx('flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold', grupo.color)}>{i + 1}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB: Evidencia ───────────────────────────── */}
          {tab === 'guias' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <strong>AVISO:</strong> Las referencias marcadas como [DATO DEMO] son ficticias y solo con fines de demostración del sistema.
                Para uso clínico real, el administrador debe cargar un repositorio de evidencia real curado.
              </div>
              {contenido.recomendacionesGuias.map((g, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 bg-white">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-clinical-50 text-clinical-700 rounded-full border border-clinical-100">
                      NE: {LABELS_EVIDENCIA[g.nivelEvidencia]}
                    </span>
                    {g.fuerzaRecomendacion && (
                      <span className="text-xs text-gray-400">{g.fuerzaRecomendacion}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{g.recomendacion}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Fuente: {g.fuente}{g.anio ? ` (${g.anio})` : ''}
                    {g.doi && <span> · DOI: {g.doi}</span>}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB: Módulo REMEINIA ─────────────────────── */}
          {tab === 'academico' && (
            <div className="space-y-5">
              {/* Sello */}
              <div className="flex items-center justify-center">
                <div className={clsx(
                  'flex flex-col items-center gap-3 p-6 rounded-2xl border-2',
                  plan.avalaRemeinia
                    ? 'bg-clinical-50 border-clinical-300'
                    : 'bg-gray-50 border-dashed border-gray-200',
                )}>
                  <div className={clsx(
                    'w-16 h-16 rounded-full flex items-center justify-center',
                    plan.avalaRemeinia ? 'bg-clinical-500' : 'bg-gray-200',
                  )}>
                    <Shield className={clsx('w-8 h-8', plan.avalaRemeinia ? 'text-white' : 'text-gray-400')} />
                  </div>
                  <div className="text-center">
                    <p className={clsx('font-bold text-lg', plan.avalaRemeinia ? 'text-clinical-700' : 'text-gray-400')}>
                      {plan.avalaRemeinia ? '✓ Avalado por REMEINIA' : 'Pendiente de aval REMEINIA'}
                    </p>
                    {plan.avalaRemeinia && (
                      <p className="text-xs text-clinical-500 mt-1">
                        Avalado por: {plan.avalistaNombre} · {plan.fechaAval ? format(new Date(plan.fechaAval), "dd/MM/yyyy") : ''}
                      </p>
                    )}
                    {!plan.avalaRemeinia && (
                      <p className="text-xs text-gray-400 mt-1">Este plan está pendiente de revisión académica por el comité REMEINIA</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información académica */}
              <div className="bg-clinical-50 border border-clinical-100 rounded-xl p-5">
                <h3 className="font-semibold text-clinical-800 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Sustento académico
                </h3>
                <p className="text-sm text-clinical-700 leading-relaxed mb-3">
                  REMEINIA Care AI es una plataforma de apoyo clínico cuyo contenido está fundamentado en evidencia
                  científica actualizada. El proceso de análisis es transparente y auditable: cada sugerencia
                  muestra los datos clínicos que la respaldan y el nivel de confianza de la recomendación.
                </p>
                <p className="text-sm text-clinical-700 leading-relaxed mb-3">
                  El motor de análisis no realiza inferencias de diagnósticos médicos. Solo genera sugerencias de
                  <strong> diagnósticos de enfermería</strong> basados en los hallazgos registrados, respetando el
                  marco conceptual de la práctica de enfermería basada en evidencia.
                </p>
                <div className="text-xs text-clinical-600 bg-clinical-100/50 rounded-lg p-3">
                  <p className="font-semibold mb-1">Principios éticos de la plataforma:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Transparencia en las recomendaciones y sus fundamentos</li>
                    <li>Explicabilidad del razonamiento clínico</li>
                    <li>Apoyo al juicio profesional, no sustitución</li>
                    <li>Trazabilidad de todas las acciones (bitácora)</li>
                    <li>Privacidad del paciente desde el diseño</li>
                    <li>Uso de catálogos licenciados para datos clasificatorios</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
