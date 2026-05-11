// ============================================================
// REMEINIA Care AI — Motor de Análisis Clínico Principal
// AVISO LEGAL: Este motor genera SUGERENCIAS de apoyo clínico.
// No sustituye el juicio profesional de enfermería ni médico.
// Todas las recomendaciones deben ser verificadas por el
// profesional de salud responsable.
// ============================================================

import type {
  ValoracionFormData,
  DiagnosticoEnfermeriaSugerido,
  ResultadoSugerido,
  IntervencionSugerida,
  RecomendacionGuia,
  PlanCuidadosCompleto,
  ResultadoMotorClinico,
  NivelConfianza,
  AlertaClinica,
} from '@/types/clinical';
import { evaluarReglasClinicas } from './rules';
import { normalizeFio2, formatFio2 } from './fio2';

// Evita tratar 0 como dato faltante en reglas numéricas.
const hasNumericValue = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

// ─── Aviso estándar que siempre acompaña al plan ────────────
const AVISO_HERRAMIENTA =
  'IMPORTANTE: Este plan es generado por un sistema de apoyo a la toma de decisiones clínicas. ' +
  'No sustituye el juicio clínico profesional. Cada recomendación debe ser evaluada, ' +
  'aceptada o modificada por el profesional de enfermería responsable del paciente. ' +
  'Aval académico: REMEINIA.';
const TEXTO_DEMO = 'Contenido demostrativo para apoyo académico y clínico, requiere validación profesional.';

// ─── Función principal del motor clínico ────────────────────
export function ejecutarMotorClinico(datos: ValoracionFormData): ResultadoMotorClinico {
  const { signosVitales: sv, gasometria: gaso, laboratorios: lab, ventilacion: vent, dispositivos: disp } = datos;

  // 1. Evaluar reglas y alertas
  const { alertas, estadoPaciente, camposFaltantes } = evaluarReglasClinicas({
    signosVitales: sv,
    gasometria: gaso,
    laboratorios: lab,
    ventilacion: vent,
    dispositivos: disp,
    comorbilidades: datos.comorbilidades,
    diagnosticoMedico: datos.diagnosticoMedico,
  });

  // 2. Calcular PaFiO2 si no está calculado
  let paFiO2 = gaso.PaFiO2;
  const fio2Normalizada = normalizeFio2(vent.fio2);
  if (!hasNumericValue(paFiO2) && hasNumericValue(gaso.PaO2) && fio2Normalizada !== null) {
    paFiO2 = Math.round(gaso.PaO2 / fio2Normalizada);
  }

  // 3. Determinar nivel de confianza global
  const confianzaGlobal: NivelConfianza =
    camposFaltantes.length >= 5 ? 'INSUFICIENTE_DATOS' :
    camposFaltantes.length >= 3 ? 'BAJA' :
    alertas.some(a => a.tipo === 'critica') ? 'ALTA' : 'MEDIA';

  // 4. Generar diagnósticos sugeridos
  let diagnosticos = generarDiagnosticos(datos, alertas, paFiO2);

  // 5. Generar resultados esperados
  let resultados = generarResultados(diagnosticos);

  // 6. Generar intervenciones
  let intervenciones = generarIntervenciones(datos, diagnosticos, paFiO2);
  ({ diagnosticos: diagnosticos, resultados, intervenciones } = completeDiagnosisStructure(diagnosticos, resultados, intervenciones));

  // 7. Generar recomendaciones por guías
  const recomendacionesGuias = generarRecomendacionesGuias(datos, alertas, paFiO2);

  // 8. Organizar prioridades
  const { inmediatas, intermedias, vigilancia } = organizarPrioridades(diagnosticos, alertas, datos);

  // 9. Generar explicación del diagnóstico en lenguaje claro
  const explicacion = generarExplicacionDiagnostico(datos);

  const plan: PlanCuidadosCompleto = {
    resumenPaciente: generarResumenPaciente(datos),
    explicacionDiagnostico: explicacion,
    generadoEn: new Date().toISOString(),
    esDemoFicticio: false,
    diagnosticos,
    resultados,
    intervenciones,
    recomendacionesGuias,
    prioridadesInmediatas: inmediatas,
    prioridadesIntermedias: intermedias,
    vigilanciaContinua: vigilancia,
    alertas,
  };

  return {
    estadoPaciente,
    alertas,
    plan,
    camposFaltantes,
    confianzaGlobal,
    advertenciaGeneral: AVISO_HERRAMIENTA,
  };
}

function completeDiagnosisStructure(
  diagnosticos: DiagnosticoEnfermeriaSugerido[],
  resultados: ResultadoSugerido[],
  intervenciones: IntervencionSugerida[],
): { diagnosticos: DiagnosticoEnfermeriaSugerido[]; resultados: ResultadoSugerido[]; intervenciones: IntervencionSugerida[] } {
  const fallbackMsg = 'No especificado por el motor clínico; requiere validación por personal de enfermería responsable.';
  const tagByCode: Record<string, { dominio: string; justificacion: string; criterioA: string; criterioB: string }> = {
    'DEMO-001': { dominio: 'Oxigenación y ventilación', justificacion: 'Diagnóstico sugerido compatible con taxonomía enfermera por compromiso de oxigenación.', criterioA: 'Mejoría de oxigenación', criterioB: 'Disminución del trabajo respiratorio' },
    'DEMO-002': { dominio: 'Ventilación y mecánica respiratoria', justificacion: 'Diagnóstico sugerido compatible con taxonomía enfermera por patrón ventilatorio alterado.', criterioA: 'FR en meta clínica', criterioB: 'Ventilación eficaz durante el turno' },
    'DEMO-003': { dominio: 'Seguridad y control de infecciones', justificacion: 'Diagnóstico sugerido compatible con taxonomía enfermera por riesgo infeccioso.', criterioA: 'Sin progresión de infección', criterioB: 'Cumplimiento de bundle de prevención' },
    'DEMO-004': { dominio: 'Hemodinámica y perfusión', justificacion: 'Diagnóstico sugerido compatible con taxonomía enfermera por compromiso de perfusión.', criterioA: 'PAM en objetivo', criterioB: 'Diuresis y lactato favorables' },
    'DEMO-005': { dominio: 'Confort y percepción', justificacion: 'Diagnóstico sugerido compatible con taxonomía enfermera por dolor agudo.', criterioA: 'Dolor ≤ 3/10', criterioB: 'Confort percibido por paciente' },
    'DEMO-006': { dominio: 'Integridad cutánea y movilidad', justificacion: 'Diagnóstico sugerido compatible con taxonomía enfermera por riesgo de lesión por presión.', criterioA: 'Piel íntegra', criterioB: 'Reposición postural documentada' },
    'DEMO-007': { dominio: 'Hemodinámica crítica', justificacion: 'Diagnóstico sugerido compatible con taxonomía enfermera por riesgo de shock.', criterioA: 'Sin deterioro hemodinámico', criterioB: 'Sin signos de hipoperfusión progresiva' },
    'DEMO-008': { dominio: 'Metabólico/endocrino', justificacion: 'Diagnóstico sugerido compatible con taxonomía enfermera por inestabilidad glucémica.', criterioA: 'Glucosa en rango meta', criterioB: 'Sin eventos hipo/hiperglucémicos' },
    'DEMO-009': { dominio: 'Neurológico', justificacion: 'Diagnóstico sugerido compatible con taxonomía enfermera por alteración neurológica.', criterioA: 'Sin deterioro de Glasgow', criterioB: 'Revaloración neurológica completa' },
    'DEMO-010': { dominio: 'Seguridad del paciente', justificacion: 'Diagnóstico sugerido compatible con taxonomía enfermera por riesgo de caídas.', criterioA: 'Sin caídas', criterioB: 'Medidas preventivas implementadas' },
  };

  const dxFixed = diagnosticos.map((dx) => {
    const tag = tagByCode[dx.codigo];
    return {
      ...dx,
      dominioClinico: dx.dominioClinico ?? tag?.dominio ?? 'No especificado por el motor clínico',
      justificacion: dx.justificacion || tag?.justificacion || fallbackMsg,
      criteriosEvaluacion: (dx.criteriosEvaluacion && dx.criteriosEvaluacion.length >= 2)
        ? dx.criteriosEvaluacion
        : [tag?.criterioA ?? fallbackMsg, tag?.criterioB ?? fallbackMsg],
    };
  });

  const resultadosFixed = [...resultados];
  const intervencionesFixed = [...intervenciones];
  for (const dx of dxFixed) {
    const resultadosDx = resultadosFixed.filter(r => r.relacionadoCon === dx.codigo);
    while (resultadosDx.length < 2) {
      const idx = resultadosDx.length + 1;
      const item: ResultadoSugerido = {
        codigo: `${dx.codigo}-NOC-FB-${idx}`,
        etiqueta: `Resultado esperado tipo NOC: ${dx.etiqueta}`,
        indicadores: ['Evaluación clínica por turno', 'Meta individualizada con validación profesional'],
        metaEsperada: fallbackMsg,
        relacionadoCon: dx.codigo,
        confianza: 'BAJA',
      };
      resultadosFixed.push(item);
      resultadosDx.push(item);
    }

    const intervDx = intervencionesFixed.filter(i => i.relacionadaCon === dx.codigo);
    while (intervDx.length < 2) {
      const idx = intervDx.length + 1;
      const item: IntervencionSugerida = {
        codigo: `${dx.codigo}-NIC-FB-${idx}`,
        etiqueta: `Intervención sugerida tipo NIC: ${dx.etiqueta}`,
        actividades: [
          'Actividades de enfermería sugeridas: monitorización clínica según protocolo.',
          'Actividades de enfermería sugeridas: documentación estructurada por turno.',
          'Actividades de enfermería sugeridas: escalamiento oportuno de hallazgos críticos.',
        ],
        frecuencia: 'Cada turno',
        relacionadaCon: dx.codigo,
        confianza: 'BAJA',
      };
      intervencionesFixed.push(item);
      intervDx.push(item);
    }

    intervDx.forEach((i) => {
      if (!i.actividades || i.actividades.length < 3) {
        i.actividades = [
          ...(i.actividades ?? []),
          'No especificado por el motor clínico; requiere validación por personal de enfermería responsable.',
          'No especificado por el motor clínico; requiere validación por personal de enfermería responsable.',
          'No especificado por el motor clínico; requiere validación por personal de enfermería responsable.',
        ].slice(0, 3);
      }
    });
  }

  return { diagnosticos: dxFixed, resultados: resultadosFixed, intervenciones: intervencionesFixed };
}

// ─── Generar resumen del paciente ────────────────────────────
function generarResumenPaciente(d: ValoracionFormData): string {
  const sexoLabel = { MASCULINO: 'masculino', FEMENINO: 'femenino', OTRO: 'otro sexo', NO_ESPECIFICADO: 'sexo no especificado' }[d.sexo];
  const comorbStr = d.comorbilidades?.length ? ` Con antecedentes de: ${d.comorbilidades.join(', ')}.` : '';
  const svc = d.signosVitales;
  const vital = hasNumericValue(svc?.saturacionO2)
    ? ` SpO₂ ${svc.saturacionO2}%, FC ${svc.frecuenciaCardiaca ?? 'NR'} lpm, FR ${svc.frecuenciaRespir ?? 'NR'} rpm, T° ${svc.temperatura ?? 'NR'}°C, PAM ${svc.presionArterialMedia ?? 'NR'} mmHg.`
    : '';
  return `Paciente ${sexoLabel} de ${d.edad} años, adscrito a ${d.servicio}. Diagnóstico médico: ${d.diagnosticoMedico}. Motivo de atención: ${d.motivoAtencion}.${comorbStr}${vital}`;
}

// ─── Generar explicación del diagnóstico (lenguaje claro) ────
function generarExplicacionDiagnostico(d: ValoracionFormData): string {
  // Explicación simplificada para enfermería, no copia texto editorial
  const dx = d.diagnosticoMedico.toLowerCase();
  let base = `El diagnóstico médico de este paciente es: "${d.diagnosticoMedico}". `;

  if (dx.includes('sdra') || dx.includes('distress') || dx.includes('dificultad respiratoria')) {
    base += 'El SDRA es un síndrome de inflamación pulmonar severa que deteriora el intercambio de gases. Los pulmones se llenan de líquido y no oxigenan correctamente la sangre. El soporte con ventilación mecánica y el cuidado intensivo de enfermería son fundamentales.';
  } else if (dx.includes('sepsis') || dx.includes('séptico')) {
    base += 'La sepsis es una respuesta inflamatoria sistémica grave a una infección. Puede comprometer múltiples órganos. El tratamiento temprano con antibióticos, control del foco y soporte hemodinámico son pilares del manejo.';
  } else if (dx.includes('posoperatorio') || dx.includes('posquirúrgico') || dx.includes('cirugia') || dx.includes('cirugía')) {
    base += 'El período posoperatorio requiere vigilancia estrecha de herida, control del dolor, prevención de complicaciones pulmonares por inmovilidad y movilización precoz. El dolor mal controlado puede incrementar el riesgo de atelectasias y trombosis.';
  } else if (dx.includes('neumonia') || dx.includes('neumonía')) {
    base += 'La neumonía es una infección del parénquima pulmonar que puede comprometer el intercambio gaseoso. El manejo de enfermería incluye optimizar la oxigenación, prevenir complicaciones y apoyar la adherencia al tratamiento antibiótico.';
  } else {
    base += 'El plan de cuidados se genera a partir de los datos clínicos capturados. Se recomienda revisar cada sugerencia en contexto del paciente específico.';
  }

  return base;
}

// ─── Generador de diagnósticos de enfermería ────────────────
function generarDiagnosticos(
  d: ValoracionFormData,
  alertas: AlertaClinica[],
  paFiO2?: number,
): DiagnosticoEnfermeriaSugerido[] {
  const diagnosticos: DiagnosticoEnfermeriaSugerido[] = [];
  const sv = d.signosVitales;
  const gaso = d.gasometria;
  const lab = d.laboratorios;
  const vent = d.ventilacion;
  const disp = d.dispositivos;
  const hayCritica = alertas.some(a => a.tipo === 'critica');

  // ── Deterioro del intercambio gaseoso ────────────────────
  const deterioroGases = (hasNumericValue(sv.saturacionO2) && sv.saturacionO2 < 94) ||
    (hasNumericValue(paFiO2) && paFiO2 < 300) ||
    (hasNumericValue(gaso.pH) && gaso.pH < 7.35);
  if (deterioroGases) {
    const manifestaciones: string[] = [];
    if (hasNumericValue(sv.saturacionO2)) manifestaciones.push(`SpO₂ ${sv.saturacionO2}%`);
    if (hasNumericValue(paFiO2)) manifestaciones.push(`PaFiO₂ ${paFiO2}`);
    if (hasNumericValue(gaso.pH)) manifestaciones.push(`pH ${gaso.pH}`);
    if (hasNumericValue(gaso.PaCO2)) manifestaciones.push(`PaCO₂ ${gaso.PaCO2} mmHg`);
    diagnosticos.push({
      codigo: 'DEMO-001',
      etiqueta: 'Deterioro del intercambio gaseoso',
      dominioClinico: 'Oxigenación y ventilación',
      prioridad: (hasNumericValue(sv.saturacionO2) && sv.saturacionO2 < 88) || (hasNumericValue(paFiO2) && paFiO2 < 150) ? 'INMEDIATA' : 'INTERMEDIA',
      factoresRelacionados: ['Cambios en la membrana alveolocapilar', 'Desequilibrio ventilación-perfusión'],
      manifestacionesClave: manifestaciones,
      justificacion: `Diagnóstico de enfermería sugerido compatible con taxonomía enfermera. Relacionado con alteración ventilación/perfusión, manifestado por ${manifestaciones.join(', ')}. ${TEXTO_DEMO}`,
      criteriosEvaluacion: ['SpO₂ en meta según contexto clínico', 'Menor trabajo respiratorio', 'Mejoría de PaFiO₂ seriada'],
      confianza: manifestaciones.length >= 3 ? 'ALTA' : 'MEDIA',
      evidenciaIds: [],
    });
  }

  // ── Patrón respiratorio ineficaz ─────────────────────────
  const patronIneficaz = (hasNumericValue(sv.frecuenciaRespir) && sv.frecuenciaRespir > 24) ||
    vent.musculosAccesorios || (vent.activa && !vent.sincroniaVentilador);
  if (patronIneficaz) {
    const manifestaciones: string[] = [];
    if (hasNumericValue(sv.frecuenciaRespir) && sv.frecuenciaRespir > 24) manifestaciones.push(`FR ${sv.frecuenciaRespir} rpm`);
    if (vent.musculosAccesorios) manifestaciones.push('Uso de músculos accesorios');
    if (vent.activa && !vent.sincroniaVentilador) manifestaciones.push('Asincronía ventilador-paciente');
    if (!deterioroGases) { // Evitar duplicar si ya hay deterioro de gases
      diagnosticos.push({
        codigo: 'DEMO-002',
        etiqueta: 'Patrón respiratorio ineficaz',
        dominioClinico: 'Ventilación y mecánica respiratoria',
        prioridad: hasNumericValue(sv.frecuenciaRespir) && sv.frecuenciaRespir > 30 ? 'INMEDIATA' : 'INTERMEDIA',
        factoresRelacionados: ['Fatiga de músculos respiratorios', 'Proceso patológico subyacente'],
        manifestacionesClave: manifestaciones,
        justificacion: `Diagnóstico de enfermería sugerido: relacionado con fatiga respiratoria y manifestado por ${manifestaciones.join(', ')}. ${TEXTO_DEMO}`,
        criteriosEvaluacion: ['FR en rango objetivo', 'Sin uso de músculos accesorios', 'Sin asincronía clínicamente relevante'],
        confianza: manifestaciones.length >= 2 ? 'ALTA' : 'MEDIA',
      });
    }
  }

  // ── Perfusión tisular periférica ineficaz ────────────────
  const pamCalc = hasNumericValue(sv.presionArterialMedia) ? sv.presionArterialMedia : (hasNumericValue(sv.tensionArterialSis) && hasNumericValue(sv.tensionArterialDias)
    ? Math.round((sv.tensionArterialSis + 2 * sv.tensionArterialDias) / 3) : undefined);
  const hipoperfusion = (hasNumericValue(pamCalc) && pamCalc < 65) || (hasNumericValue(gaso.Lactato) && gaso.Lactato >= 2);
  if (hipoperfusion) {
    const manifestaciones: string[] = [];
    if (hasNumericValue(pamCalc) && pamCalc < 65) manifestaciones.push(`PAM ${pamCalc} mmHg`);
    if (hasNumericValue(gaso.Lactato) && gaso.Lactato >= 2) manifestaciones.push(`Lactato ${gaso.Lactato} mmol/L`);
    if (hasNumericValue(sv.diuresisHora) && sv.diuresisHora < 0.5) manifestaciones.push(`Diuresis ${sv.diuresisHora} mL/kg/hr`);
    diagnosticos.push({
      codigo: 'DEMO-004',
      etiqueta: 'Perfusión tisular periférica ineficaz',
      dominioClinico: 'Hemodinámica y perfusión',
      prioridad: 'INMEDIATA',
      factoresRelacionados: ['Hipotensión', 'Hipovolemia', 'Vasoplejía séptica'],
      manifestacionesClave: manifestaciones,
      justificacion: `Diagnóstico de enfermería sugerido relacionado con compromiso hemodinámico, manifestado por ${manifestaciones.join(', ')}. ${TEXTO_DEMO}`,
      criteriosEvaluacion: ['PAM ≥ meta clínica', 'Lactato en descenso', 'Diuresis adecuada'],
      confianza: 'ALTA',
    });
  }

  // ── Riesgo de infección ──────────────────────────────────
  const dispositivosInvasivos: string[] = [];
  if (disp.cvc?.presente) dispositivosInvasivos.push(`CVC día ${disp.cvc.dias ?? 'N/D'}`);
  if (disp.ventilacion_mecanica?.presente) dispositivosInvasivos.push(`VMI día ${disp.ventilacion_mecanica.dias ?? 'N/D'}`);
  if (disp.cateter_urinario?.presente) dispositivosInvasivos.push(`Catéter urinario día ${disp.cateter_urinario.dias ?? 'N/D'}`);
  if (disp.sonda_enteral?.presente) dispositivosInvasivos.push('SNG');

  const signos_infeccion: string[] = [];
  if (hasNumericValue(lab.leucocitos) && (lab.leucocitos > 12000 || lab.leucocitos < 4000)) signos_infeccion.push(`Leucocitos ${lab.leucocitos}`);
  if (hasNumericValue(lab.procalcitonina) && lab.procalcitonina > 0.5) signos_infeccion.push(`PCT ${lab.procalcitonina}`);
  if (hasNumericValue(lab.pcr) && lab.pcr > 10) signos_infeccion.push(`PCR ${lab.pcr}`);
  if (hasNumericValue(sv.temperatura) && sv.temperatura > 38.3) signos_infeccion.push(`T° ${sv.temperatura}°C`);

  if (dispositivosInvasivos.length >= 1 || signos_infeccion.length >= 2) {
    diagnosticos.push({
      codigo: 'DEMO-003',
      etiqueta: 'Riesgo de infección',
      dominioClinico: 'Seguridad y control de infecciones',
      prioridad: signos_infeccion.length >= 3 ? 'INMEDIATA' : 'INTERMEDIA',
      factoresRiesgo: [...dispositivosInvasivos, 'Procedimientos invasivos', 'Alteración de defensas del organismo'],
      manifestacionesClave: [...signos_infeccion, ...dispositivosInvasivos],
      justificacion: `Diagnóstico de enfermería sugerido compatible con taxonomía enfermera. Relacionado con exposición a dispositivos y riesgo biológico. ${TEXTO_DEMO}`,
      criteriosEvaluacion: ['Sin signos locales de infección', 'Tendencia inflamatoria estable o descendente', 'Cumplimiento de bundle IAAS'],
      confianza: dispositivosInvasivos.length >= 2 ? 'ALTA' : 'MEDIA',
    });
  }

  // ── Dolor agudo ──────────────────────────────────────────
  if (sv.escalaDolor !== undefined && sv.escalaDolor >= 4) {
    diagnosticos.push({
      codigo: 'DEMO-005',
      etiqueta: 'Dolor agudo',
      dominioClinico: 'Confort y percepción',
      prioridad: sv.escalaDolor >= 7 ? 'INMEDIATA' : 'INTERMEDIA',
      factoresRelacionados: ['Proceso patológico', 'Procedimientos invasivos', 'Herida quirúrgica'],
      manifestacionesClave: [`EVA/escala dolor: ${sv.escalaDolor}/10`],
      justificacion: `Diagnóstico de enfermería sugerido: manifestado por escala de dolor ${sv.escalaDolor}/10. ${TEXTO_DEMO}`,
      criteriosEvaluacion: ['Dolor ≤ 3/10 en reposo', 'Mejor descanso', 'Menor respuesta autonómica al dolor'],
      confianza: 'ALTA',
    });
  }

  // ── Riesgo de lesión por presión (inferido de inmovilidad + dispositivos) ──
  const riesgoUPP =
    (d.valoracionSistemas?.riesgo_upp?.toLowerCase().includes('alto') ||
    d.valoracionSistemas?.riesgo_upp?.toLowerCase().includes('braden') ||
    d.valoracionSistemas?.movilidad?.toLowerCase().includes('encamado') ||
    d.valoracionSistemas?.movilidad?.toLowerCase().includes('inmovilidad') ||
    (dispositivosInvasivos.length >= 2));
  if (riesgoUPP) {
    diagnosticos.push({
      codigo: 'DEMO-006',
      etiqueta: 'Riesgo de lesión por presión',
      dominioClinico: 'Integridad cutánea y movilidad',
      prioridad: 'INMEDIATA',
      factoresRiesgo: ['Inmovilidad', 'Presión prolongada', 'Dispositivos médicos', 'Nutrición comprometida'],
      manifestacionesClave: [
        d.valoracionSistemas?.riesgo_upp ?? 'Valoración de riesgo disponible en notas',
        ...dispositivosInvasivos,
      ],
      justificacion: `Diagnóstico de enfermería sugerido relacionado con inmovilidad/dispositivos. ${TEXTO_DEMO}`,
      criteriosEvaluacion: ['Sin nuevas lesiones por presión', 'Piel íntegra por turno', 'Reposición postural documentada'],
      confianza: 'MEDIA',
    });
  }
  if ((hasNumericValue(pamCalc) && pamCalc < 65) || (hasNumericValue(gaso.Lactato) && gaso.Lactato >= 2)) {
    diagnosticos.push({
      codigo: 'DEMO-007',
      etiqueta: 'Riesgo de shock',
      dominioClinico: 'Hemodinámica crítica',
      prioridad: 'INMEDIATA',
      factoresRiesgo: ['Hipotensión', 'Hipoperfusión tisular', 'Respuesta inflamatoria sistémica'],
      manifestacionesClave: ['Compromiso hemodinámico potencial', ...(hasNumericValue(gaso.Lactato) ? [`Lactato ${gaso.Lactato} mmol/L`] : [])],
      justificacion: `Diagnóstico de enfermería sugerido compatible con taxonomía enfermera por riesgo de deterioro circulatorio agudo. ${TEXTO_DEMO}`,
      criteriosEvaluacion: ['Perfusión periférica conservada', 'Estado mental y diuresis estables', 'Sin progresión de signos de shock'],
      confianza: 'MEDIA',
    });
  }

  // Ordenar por prioridad
  const orden: Record<string, number> = { INMEDIATA: 0, INTERMEDIA: 1, VIGILANCIA: 2 };
  return diagnosticos.sort((a, b) => orden[a.prioridad] - orden[b.prioridad]);
}

// ─── Generador de resultados esperados (NOC-like) ─────────────
function generarResultados(diagnosticos: DiagnosticoEnfermeriaSugerido[]): ResultadoSugerido[] {
  const mapa: Record<string, ResultadoSugerido[]> = {
    'DEMO-001': [{
      codigo: 'DEMO-NOC-001',
      etiqueta: 'Resultado esperado tipo NOC: Estado respiratorio - intercambio gaseoso',
      indicadores: ['SpO₂ ≥ 94%', 'PaFiO₂ en mejora', 'pH arterial 7.35-7.45', 'FR 12-20 rpm'],
      metaEsperada: 'SpO₂ ≥ 94% sostenida. PaFiO₂ en tendencia ascendente. Sin uso de músculos accesorios.',
      relacionadoCon: 'DEMO-001',
      confianza: 'ALTA',
    },{
      codigo: 'DEMO-NOC-001C',
      etiqueta: 'Resultado esperado tipo NOC: Permeabilidad de vía aérea',
      indicadores: ['Secreciones manejables', 'Auscultación con mejoría', 'Menor trabajo respiratorio'],
      metaEsperada: 'Mantener vía aérea permeable y patrón ventilatorio seguro.',
      relacionadoCon: 'DEMO-001',
      confianza: 'MEDIA',
    }],
    'DEMO-002': [{
      codigo: 'DEMO-NOC-001B',
      etiqueta: 'Resultado esperado tipo NOC: Estado respiratorio - ventilación',
      indicadores: ['FR 12-20 rpm', 'Expansión torácica simétrica', 'Sin uso de músculos accesorios'],
      metaEsperada: 'Patrón respiratorio eficaz con FR < 24 rpm. Sin signos de trabajo respiratorio aumentado.',
      relacionadoCon: 'DEMO-002',
      confianza: 'MEDIA',
    },{
      codigo: 'DEMO-NOC-001D',
      etiqueta: 'Resultado esperado tipo NOC: Esfuerzo respiratorio',
      indicadores: ['Sin tiraje', 'Disminución de disnea', 'Coordinación respiratoria adecuada'],
      metaEsperada: 'Disminuir signos de disfunción ventilatoria durante el turno.',
      relacionadoCon: 'DEMO-002',
      confianza: 'MEDIA',
    }],
    'DEMO-003': [{
      codigo: 'DEMO-NOC-004',
      etiqueta: 'Severidad de la infección',
      indicadores: ['T° 36-38°C', 'Leucocitos 4000-11000', 'PCR en descenso', 'Sin signos locales de infección en accesos'],
      metaEsperada: 'Control de parámetros infecciosos. Sin datos de IAAS asociada a dispositivo.',
      relacionadoCon: 'DEMO-003',
      confianza: 'MEDIA',
    },{
      codigo: 'DEMO-NOC-004B',
      etiqueta: 'Resultado esperado tipo NOC: Control del riesgo infeccioso',
      indicadores: ['Cumplimiento de bundle', 'Sitios de acceso sin eritema', 'Sin fiebre persistente'],
      metaEsperada: 'Reducir riesgo de IAAS asociada a dispositivos.',
      relacionadoCon: 'DEMO-003',
      confianza: 'MEDIA',
    }],
    'DEMO-004': [{
      codigo: 'DEMO-NOC-002',
      etiqueta: 'Perfusión tisular: periférica',
      indicadores: ['PAM ≥ 65 mmHg', 'Lactato < 2 mmol/L', 'Diuresis ≥ 0.5 mL/kg/hr', 'Llenado capilar < 2 seg'],
      metaEsperada: 'PAM mantenida ≥ 65 mmHg. Lactato en tendencia descendente. Diuresis conservada.',
      relacionadoCon: 'DEMO-004',
      confianza: 'ALTA',
    },{
      codigo: 'DEMO-NOC-002B',
      etiqueta: 'Resultado esperado tipo NOC: Perfusión orgánica',
      indicadores: ['Estado neurológico sin deterioro', 'Extremidades perfundidas', 'Diuresis adecuada'],
      metaEsperada: 'Sostener perfusión tisular efectiva durante el turno.',
      relacionadoCon: 'DEMO-004',
      confianza: 'ALTA',
    }],
    'DEMO-005': [{
      codigo: 'DEMO-NOC-003',
      etiqueta: 'Control del dolor',
      indicadores: ['Escala dolor ≤ 3/10 en reposo', 'El paciente verbaliza alivio', 'Signos vitales en rango aceptable'],
      metaEsperada: 'Dolor controlado ≤ 3/10 en reposo. El paciente puede descansar y cooperar con cuidados.',
      relacionadoCon: 'DEMO-005',
      confianza: 'ALTA',
    },{
      codigo: 'DEMO-NOC-003B',
      etiqueta: 'Resultado esperado tipo NOC: Confort del paciente',
      indicadores: ['Mayor tolerancia a movilización', 'Expresión de alivio', 'Sueño reparador'],
      metaEsperada: 'Mejorar el confort general con control analgésico multimodal.',
      relacionadoCon: 'DEMO-005',
      confianza: 'MEDIA',
    }],
    'DEMO-006': [{
      codigo: 'DEMO-NOC-006',
      etiqueta: 'Integridad tisular: piel y membranas',
      indicadores: ['Ausencia de lesiones por presión', 'Piel íntegra en zonas de riesgo', 'Hidratación cutánea adecuada'],
      metaEsperada: 'Mantener integridad cutánea. Sin nuevas lesiones por presión durante la estancia.',
      relacionadoCon: 'DEMO-006',
      confianza: 'MEDIA',
    },{
      codigo: 'DEMO-NOC-006B',
      etiqueta: 'Resultado esperado tipo NOC: Prevención de daño por presión',
      indicadores: ['Cambios posturales documentados', 'Sin eritema persistente', 'Puntos de presión protegidos'],
      metaEsperada: 'Mantener medidas preventivas completas por turno.',
      relacionadoCon: 'DEMO-006',
      confianza: 'MEDIA',
    }],
    'DEMO-007': [{
      codigo: 'DEMO-NOC-007',
      etiqueta: 'Resultado esperado tipo NOC: Prevención de shock',
      indicadores: ['PAM objetivo', 'Lactato estable/descendente', 'Perfusión periférica conservada'],
      metaEsperada: 'Prevenir progresión a shock mediante vigilancia y respuesta temprana.',
      relacionadoCon: 'DEMO-007',
      confianza: 'MEDIA',
    },{
      codigo: 'DEMO-NOC-007B',
      etiqueta: 'Resultado esperado tipo NOC: Estabilidad hemodinámica',
      indicadores: ['Sin hipotensión sostenida', 'Estado mental estable', 'Diuresis sostenida'],
      metaEsperada: 'Mantener estabilidad hemodinámica durante el seguimiento inmediato.',
      relacionadoCon: 'DEMO-007',
      confianza: 'MEDIA',
    }],
  };

  return diagnosticos
    .flatMap(dx => mapa[dx.codigo] ?? []);
}

// ─── Generador de intervenciones (NIC-like) ───────────────────
function generarIntervenciones(
  d: ValoracionFormData,
  diagnosticos: DiagnosticoEnfermeriaSugerido[],
  paFiO2?: number,
): IntervencionSugerida[] {
  const intervenciones: IntervencionSugerida[] = [];
  const codigoDx = diagnosticos.map(dx => dx.codigo);

  if (codigoDx.includes('DEMO-001') || codigoDx.includes('DEMO-002')) {
    intervenciones.push({
      codigo: 'DEMO-NIC-001',
      etiqueta: 'Manejo de la vía aérea',
      actividades: [
        `Mantener cabecera elevada 30–45° ${d.ventilacion.activa ? '(o según protocolo de VM)' : 'si no contraindicado'}`,
        d.ventilacion.activa
          ? 'Verificar posición y fijación del tubo endotraqueal. Registrar marca de fijación.'
          : 'Evaluar necesidad de aspiración de secreciones con técnica aséptica',
        'Monitorizar SpO₂ de forma continua',
        'Evaluar patrón respiratorio, uso de músculos accesorios y sincronía',
        'Registrar características de secreciones: color, consistencia, cantidad',
      ],
      frecuencia: 'Continua y cada valoración de turno',
      relacionadaCon: 'DEMO-001',
      confianza: 'ALTA',
    });

    if (d.ventilacion.activa) {
      intervenciones.push({
        codigo: 'DEMO-NIC-002',
        etiqueta: 'Monitorización respiratoria y parámetros de ventilación',
        actividades: [
          `Registrar parámetros del ventilador: modo, FiO₂ (${formatFio2(d.ventilacion.fio2)}), PEEP, VT, FR, Ppico, Pplateau`,
          'Verificar que Pplateau < 30 cmH₂O (ventilación protectora)',
          `PaFiO₂ actual: ${paFiO2 ?? 'calcular con gasometría'}. Meta: tendencia ascendente`,
          'Valorar sincronía paciente-ventilador y ajustar sedoanalgesia si hay asincronía',
          'Evaluar secreciones y necesidad de aspiración con técnica estéril',
          'Verificar alarmas del ventilador activas y responder en < 30 segundos',
        ],
        frecuencia: 'Cada hora / continua',
        relacionadaCon: 'DEMO-001',
        confianza: 'ALTA',
      });
    }
  }

  if (codigoDx.includes('DEMO-004')) {
    intervenciones.push({
      codigo: 'DEMO-NIC-005',
      etiqueta: 'Cuidados circulatorios y monitoreo hemodinámico',
      actividades: [
        'Monitorizar PAM continuamente. Meta ≥ 65 mmHg (o individualizada)',
        `Infusión de vasopresor según prescripción médica: ${d.dispositivos.vasopresores?.farmaco ?? 'verificar indicación'} — no ajustar sin orden médica`,
        'Valorar llenado capilar, temperatura distal y coloración de piel cada hora',
        'Registrar diuresis horaria. Alerta si < 0.5 mL/kg/hr',
        'Vigilar tendencia de lactato sérico',
        'Evaluar estado neurológico como indicador de perfusión cerebral',
      ],
      frecuencia: 'Continua',
      relacionadaCon: 'DEMO-004',
      confianza: 'ALTA',
    });
  }

  if (codigoDx.includes('DEMO-003')) {
    intervenciones.push({
      codigo: 'DEMO-NIC-004',
      etiqueta: 'Prevención de infecciones asociadas a la atención en salud',
      actividades: [
        'Higiene de manos con los 5 momentos de la OMS antes y después de cada contacto',
        'Cuidados de catéter venoso central (CVC) según bundle institucional: curación estéril, evaluación del sitio de inserción',
        `Registrar días de cada dispositivo invasivo. CVC día ${d.dispositivos.cvc?.dias ?? 'N/D'}, TET día ${d.dispositivos.ventilacion_mecanica?.dias ?? 'N/D'}`,
        d.ventilacion.activa ? 'Aplicar bundle de prevención de NAVM: higiene oral con CHX, posición 30-45°, presión de neumotaponamiento, evitar circuito de secreciones' : 'Vigilar sitio de inserción de accesos venosos',
        'Tomar cultivos según indicación médica antes de iniciar antibióticos',
        'Vigilar signos locales de infección en cada acceso: eritema, calor, secreción',
      ],
      frecuencia: 'Cada turno / continua',
      relacionadaCon: 'DEMO-003',
      confianza: 'ALTA',
    });
  }

  if (codigoDx.includes('DEMO-005')) {
    intervenciones.push({
      codigo: 'DEMO-NIC-003',
      etiqueta: 'Manejo del dolor',
      actividades: [
        `Evaluar dolor con escala validada (EVA, CPOT si intubado, FLACC si aplica) cada 4 horas o antes de procedimientos. Escala actual: ${d.signosVitales.escalaDolor ?? 'no registrada'}/10`,
        'Administrar analgésicos según prescripción médica. Registrar hora, dosis y respuesta',
        'Explorar técnicas no farmacológicas: reposicionamiento, distracción, frío/calor local si indicado',
        'Identificar y minimizar estímulos dolorosos: ruido, luz intensa, procedimientos innecesarios',
        'Documentar respuesta al tratamiento para ajuste terapéutico',
      ],
      frecuencia: 'Cada 4 horas o PRN',
      relacionadaCon: 'DEMO-005',
      confianza: 'ALTA',
    });
  }

  if (codigoDx.includes('DEMO-006')) {
    intervenciones.push({
      codigo: 'DEMO-NIC-006',
      etiqueta: 'Prevención de lesiones por presión',
      actividades: [
        'Aplicar escala Braden en el primer contacto y cada turno. Documentar puntuación',
        'Realizar cambios de posición cada 2 horas. Registrar hora y posición',
        'Proteger prominencias óseas con superficies de apoyo adecuadas',
        'Mantener ropa de cama limpia, seca y sin pliegues',
        'Evaluar y tratar la humedad (incontinencia, diaforesis)',
        'Evaluar nutrición e hidratación como factores modificables',
        'Documentar cualquier eritema no blanqueable',
      ],
      frecuencia: 'Cada 2 horas',
      relacionadaCon: 'DEMO-006',
      confianza: 'ALTA',
    });
  }

  return intervenciones;
}

// ─── Recomendaciones basadas en guías (contenido demostrativo) ───────
function generarRecomendacionesGuias(
  d: ValoracionFormData,
  alertas: AlertaClinica[],
  paFiO2?: number,
): RecomendacionGuia[] {
  const guias: RecomendacionGuia[] = [];

  if (hasNumericValue(paFiO2) && paFiO2 < 300 && d.ventilacion.activa) {
    guias.push({
      recomendacion: '[DATO DEMO] Se recomienda estrategia ventilatoria protectora con VT 6 mL/kg de peso ideal, presión plateau < 30 cmH₂O y PEEP optimizado según curva presión-volumen.',
      fuente: 'Ejemplo académico: Guías internacionales de ventilación en SDRA (contenido demostrativo)',
      nivelEvidencia: 'IA',
      fuerzaRecomendacion: 'Fuerte',
      anio: 2023,
      esFicticia: true,
    });
    if (hasNumericValue(paFiO2) && paFiO2 < 150) {
      guias.push({
        recomendacion: '[DATO DEMO] En SDRA grave (PaFiO₂ < 150), considerar posición prono ≥ 16 horas/día según indicación médica y protocolo institucional.',
        fuente: 'Ejemplo académico: Consenso de cuidados críticos (contenido demostrativo)',
        nivelEvidencia: 'IA',
        fuerzaRecomendacion: 'Fuerte',
        anio: 2022,
        esFicticia: true,
      });
    }
  }

  if (alertas.some(a => a.mensaje.includes('sepsis') || a.mensaje.includes('SIRS'))) {
    guias.push({
      recomendacion: '[DATO DEMO] Ante sospecha de sepsis: tomar hemocultivos antes de iniciar antibióticos, medir lactato sérico, iniciar fluidoterapia y antibióticos en la primera hora (bundle Hora-1 de sepsis).',
      fuente: 'Ejemplo académico: Campaña internacional sobreviviendo a la sepsis (contenido demostrativo)',
      nivelEvidencia: 'IB',
      fuerzaRecomendacion: 'Fuerte',
      anio: 2022,
      esFicticia: true,
    });
  }

  if (d.dispositivos.cvc?.presente || d.ventilacion.activa) {
    guias.push({
      recomendacion: '[DATO DEMO] Aplicar bundles de prevención de infecciones asociadas a dispositivos (NAVM, bacteriemia por CVC, ITUAC). La higiene de manos es la medida individual más efectiva.',
      fuente: 'Ejemplo académico: Agencia de calidad de seguridad en salud (contenido demostrativo)',
      nivelEvidencia: 'IA',
      fuerzaRecomendacion: 'Fuerte',
      anio: 2023,
      esFicticia: true,
    });
  }

  guias.push({
    recomendacion: '[DATO DEMO] Evaluar dolor, agitación y delirium (tríada DAD/PAD) con escalas validadas (CPOT, RASS, CAM-ICU) cada turno en pacientes críticos. El manejo multimodal reduce días de ventilación y estancia.',
    fuente: 'Ejemplo académico: Guía de práctica clínica de cuidados críticos (contenido demostrativo)',
    nivelEvidencia: 'IB',
    fuerzaRecomendacion: 'Fuerte',
    anio: 2023,
    esFicticia: true,
  });

  return guias;
}

// ─── Organizar prioridades ───────────────────────────────────
function organizarPrioridades(
  diagnosticos: DiagnosticoEnfermeriaSugerido[],
  alertas: AlertaClinica[],
  d: ValoracionFormData,
): { inmediatas: string[]; intermedias: string[]; vigilancia: string[] } {
  const inmediatas: string[] = [];
  const intermedias: string[] = [];
  const vigilancia: string[] = [];

  // Agregar alertas críticas como prioridades inmediatas
  alertas.filter(a => a.tipo === 'critica').forEach(a => {
    const msg = a.mensaje.replace(/^(CRÍTICO|ALERTA|ALERTA SEPSIS):\s*/i, '').split('.')[0];
    if (!inmediatas.includes(msg)) inmediatas.push(msg);
  });

  // Agregar diagnósticos inmediatos
  diagnosticos.filter(dx => dx.prioridad === 'INMEDIATA').forEach(dx => {
    const item = `${dx.etiqueta} — ${dx.manifestacionesClave?.[0] ?? 'ver justificación'}`;
    if (!inmediatas.includes(item)) inmediatas.push(item);
  });

  // Diagnósticos intermedios
  diagnosticos.filter(dx => dx.prioridad === 'INTERMEDIA').forEach(dx => {
    intermedias.push(`${dx.etiqueta} — evaluación y manejo dentro del turno`);
  });

  // Vigilancia continua
  vigilancia.push('Monitorización continua de signos vitales y estado neurológico');
  if (d.signosVitales.diuresisHora !== undefined) vigilancia.push('Diuresis horaria — meta ≥ 0.5 mL/kg/hr');
  if (d.ventilacion.activa) vigilancia.push('Parámetros del ventilador y sincronía paciente-ventilador');
  if (d.dispositivos.cvc?.presente || d.dispositivos.cateter_urinario?.presente) {
    vigilancia.push('Estado de sitios de inserción de dispositivos invasivos');
  }
  if (hasNumericValue(d.signosVitales.glucosaCapilar) || hasNumericValue(d.laboratorios.glucosa)) {
    vigilancia.push('Control glucémico según protocolo');
  }

  return { inmediatas, intermedias, vigilancia };
}
