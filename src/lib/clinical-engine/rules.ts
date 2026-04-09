// ============================================================
// REMEINIA Care AI — Motor de Reglas Clínicas
// AVISO: Este módulo genera SUGERENCIAS de apoyo. No sustituye
// el juicio clínico profesional. Siempre verificar.
// ============================================================

import type {
  AlertaClinica,
  EstadoPaciente,
  SignosVitales,
  Gasometria,
  Laboratorios,
  ParametrosVentilador,
  DispositivosInvasivos,
} from '@/types/clinical';

// ─── Interfaz de entrada para el evaluador de reglas ─────────
export interface DatosEvaluacion {
  signosVitales: Partial<SignosVitales>;
  gasometria: Partial<Gasometria>;
  laboratorios: Partial<Laboratorios>;
  ventilacion: Partial<ParametrosVentilador>;
  dispositivos: Partial<DispositivosInvasivos>;
  comorbilidades?: string[];
  diagnosticoMedico?: string;
}

// ─── Evaluador principal de reglas ──────────────────────────
export function evaluarReglasClinicas(datos: DatosEvaluacion): {
  alertas: AlertaClinica[];
  estadoPaciente: EstadoPaciente;
  camposFaltantes: string[];
} {
  const alertas: AlertaClinica[] = [];
  const { signosVitales: sv, gasometria: gaso, laboratorios: lab, ventilacion: vent, dispositivos: disp } = datos;

  // ── 1. Validaciones de campos esenciales ─────────────────
  const camposFaltantes: string[] = [];
  if (!sv.saturacionO2) camposFaltantes.push('SpO2');
  if (!sv.frecuenciaCardiaca) camposFaltantes.push('Frecuencia cardíaca');
  if (!sv.presionArterialMedia && (!sv.tensionArterialSis || !sv.tensionArterialDias)) {
    camposFaltantes.push('Tensión arterial / PAM');
  }
  if (!sv.temperatura) camposFaltantes.push('Temperatura');
  if (!sv.frecuenciaRespir) camposFaltantes.push('Frecuencia respiratoria');
  if (!sv.glasgow) camposFaltantes.push('Escala Glasgow');

  if (camposFaltantes.length >= 4) {
    alertas.push({
      tipo: 'informativa',
      mensaje: `Datos insuficientes: faltan ${camposFaltantes.length} campos esenciales (${camposFaltantes.slice(0, 3).join(', ')}...). Las sugerencias tendrán baja confianza.`,
    });
  }

  // ── 2. Reglas de oxigenación ─────────────────────────────
  if (sv.saturacionO2 !== undefined) {
    if (sv.saturacionO2 < 88) {
      alertas.push({
        tipo: 'critica',
        mensaje: `CRÍTICO: SpO₂ = ${sv.saturacionO2}% — Hipoxemia grave. Intervención inmediata. Verificar vía aérea, oxigenoterapia y circulación.`,
        campo: 'saturacionO2',
        valor: sv.saturacionO2,
      });
    } else if (sv.saturacionO2 < 94) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `PRECAUCIÓN: SpO₂ = ${sv.saturacionO2}% — Hipoxemia. Evaluar causa y ajustar soporte de O₂.`,
        campo: 'saturacionO2',
        valor: sv.saturacionO2,
      });
    }
  }

  // ── 3. Reglas de relación PaO2/FiO2 ─────────────────────
  let paFiO2: number | undefined = gaso.PaFiO2;
  if (!paFiO2 && gaso.PaO2 && vent.fio2) {
    paFiO2 = Math.round(gaso.PaO2 / vent.fio2);
  }
  if (paFiO2 !== undefined) {
    if (paFiO2 < 100) {
      alertas.push({
        tipo: 'critica',
        mensaje: `CRÍTICO: PaO₂/FiO₂ = ${paFiO2} — Compatible con SDRA grave (< 100). Revisar protocolo de ventilación protectora y posición prono.`,
        campo: 'PaFiO2',
        valor: paFiO2,
      });
    } else if (paFiO2 < 200) {
      alertas.push({
        tipo: 'critica',
        mensaje: `ALERTA: PaO₂/FiO₂ = ${paFiO2} — Compatible con SDRA moderado (100-200). Optimizar ventilación protectora (VT 6 mL/kg peso ideal, Pplateau < 30).`,
        campo: 'PaFiO2',
        valor: paFiO2,
      });
    } else if (paFiO2 < 300) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `PRECAUCIÓN: PaO₂/FiO₂ = ${paFiO2} — Compatible con SDRA leve (200-300). Vigilar deterioro y valorar necesidad de soporte ventilatorio.`,
        campo: 'PaFiO2',
        valor: paFiO2,
      });
    }
  }

  // ── 4. Reglas de gasometría ──────────────────────────────
  if (gaso.pH !== undefined) {
    if (gaso.pH < 7.20) {
      alertas.push({
        tipo: 'critica',
        mensaje: `CRÍTICO: pH = ${gaso.pH} — Acidemia grave. Evaluar causa (metabólica/respiratoria) e intervención urgente.`,
        campo: 'pH',
        valor: gaso.pH,
      });
    } else if (gaso.pH < 7.35) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `PRECAUCIÓN: pH = ${gaso.pH} — Acidemia. Interpretar con PaCO₂ y HCO₃ para clasificar el trastorno ácido-base.`,
        campo: 'pH',
        valor: gaso.pH,
      });
    } else if (gaso.pH > 7.50) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `PRECAUCIÓN: pH = ${gaso.pH} — Alcalemia. Verificar hiperventilación, uso de bicarbonato o alcalosis metabólica.`,
        campo: 'pH',
        valor: gaso.pH,
      });
    }
  }

  if (gaso.Lactato !== undefined) {
    if (gaso.Lactato >= 4) {
      alertas.push({
        tipo: 'critica',
        mensaje: `CRÍTICO: Lactato = ${gaso.Lactato} mmol/L — Hiperlactemia grave (≥ 4). Alta probabilidad de hipoperfusión tisular o shock. Activar protocolo de sepsis/shock si aplica.`,
        campo: 'Lactato',
        valor: gaso.Lactato,
      });
    } else if (gaso.Lactato >= 2) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `PRECAUCIÓN: Lactato = ${gaso.Lactato} mmol/L — Hiperlactemia moderada. Evaluar perfusión tisular, hidratación y causa subyacente.`,
        campo: 'Lactato',
        valor: gaso.Lactato,
      });
    }
  }

  // ── 5. Reglas hemodinámicas ──────────────────────────────
  const pam = sv.presionArterialMedia ??
    (sv.tensionArterialSis && sv.tensionArterialDias
      ? Math.round((sv.tensionArterialSis + 2 * sv.tensionArterialDias) / 3)
      : undefined);

  if (pam !== undefined) {
    if (pam < 55) {
      alertas.push({
        tipo: 'critica',
        mensaje: `CRÍTICO: PAM = ${pam} mmHg — Hipotensión grave. Riesgo alto de falla orgánica múltiple. Soporte hemodinámico urgente.`,
        campo: 'presionArterialMedia',
        valor: pam,
      });
    } else if (pam < 65) {
      alertas.push({
        tipo: 'critica',
        mensaje: `ALERTA: PAM = ${pam} mmHg — Por debajo del umbral de perfusión orgánica (< 65). Evaluar fluidoterapia y vasopresores según indicación médica.`,
        campo: 'presionArterialMedia',
        valor: pam,
      });
    }
  }

  if (sv.frecuenciaCardiaca !== undefined) {
    if (sv.frecuenciaCardiaca > 130) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `PRECAUCIÓN: FC = ${sv.frecuenciaCardiaca} lpm — Taquicardia significativa. Evaluar causa: dolor, fiebre, hipovolemia, sepsis, arritmia.`,
        campo: 'frecuenciaCardiaca',
        valor: sv.frecuenciaCardiaca,
      });
    } else if (sv.frecuenciaCardiaca < 50) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `PRECAUCIÓN: FC = ${sv.frecuenciaCardiaca} lpm — Bradicardia. Evaluar repercusión hemodinámica y causa.`,
        campo: 'frecuenciaCardiaca',
        valor: sv.frecuenciaCardiaca,
      });
    }
  }

  // ── 6. Reglas respiratorias ──────────────────────────────
  if (sv.frecuenciaRespir !== undefined) {
    if (sv.frecuenciaRespir >= 30) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `PRECAUCIÓN: FR = ${sv.frecuenciaRespir} rpm — Taquipnea significativa. Evaluar trabajo respiratorio y necesidad de soporte ventilatorio.`,
        campo: 'frecuenciaRespir',
        valor: sv.frecuenciaRespir,
      });
    }
  }

  // ── 7. Ventilación mecánica — parámetros seguros ─────────
  if (vent.activa) {
    if (vent.presionPlateau !== undefined && vent.presionPlateau > 30) {
      alertas.push({
        tipo: 'critica',
        mensaje: `ALERTA: Presión plateau = ${vent.presionPlateau} cmH₂O — Supera límite de seguridad (> 30). Riesgo de barotrauma y VILI. Reducir VT o ajustar parámetros.`,
        campo: 'presionPlateau',
        valor: vent.presionPlateau,
      });
    }
    if (vent.presionPico !== undefined && vent.presionPico > 40) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `PRECAUCIÓN: Presión pico = ${vent.presionPico} cmH₂O — Elevada. Evaluar causa: obstrucción, broncoespasmo, asincronía.`,
        campo: 'presionPico',
        valor: vent.presionPico,
      });
    }
    if (vent.fio2 !== undefined && vent.fio2 > 0.6 && (paFiO2 === undefined || paFiO2 < 200)) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `PRECAUCIÓN: FiO₂ = ${Math.round(vent.fio2 * 100)}% con respuesta oxigenatoria pobre. Evaluar ajuste de PEEP y estrategia ventilatoria.`,
      });
    }
  }

  // ── 8. Riesgo de sepsis (criterios clínicos) ─────────────
  const criteriosSepsis: string[] = [];
  if (sv.temperatura && (sv.temperatura > 38.3 || sv.temperatura < 36)) criteriosSepsis.push('temperatura alterada');
  if (sv.frecuenciaCardiaca && sv.frecuenciaCardiaca > 90) criteriosSepsis.push('FC > 90');
  if (sv.frecuenciaRespir && sv.frecuenciaRespir > 20) criteriosSepsis.push('FR > 20');
  if (lab.leucocitos && (lab.leucocitos > 12000 || lab.leucocitos < 4000)) criteriosSepsis.push('leucocitosis/leucopenia');
  if (gaso.Lactato && gaso.Lactato >= 2) criteriosSepsis.push('lactato ≥ 2 mmol/L');
  if (lab.procalcitonina && lab.procalcitonina > 2) criteriosSepsis.push('PCT > 2 ng/mL');

  if (criteriosSepsis.length >= 3) {
    alertas.push({
      tipo: 'critica',
      mensaje: `ALERTA SEPSIS: ${criteriosSepsis.length} criterios presentes (${criteriosSepsis.join(', ')}). Evaluar foco infeccioso, activar protocolo de sepsis si hay sospecha clínica. Verificación clínica obligatoria.`,
    });
  } else if (criteriosSepsis.length === 2) {
    alertas.push({
      tipo: 'advertencia',
      mensaje: `PRECAUCIÓN: 2 criterios sugestivos de SIRS/sepsis (${criteriosSepsis.join(', ')}). Vigilar progresión y evaluar foco.`,
    });
  }

  // ── 9. Neurológico ──────────────────────────────────────
  if (sv.glasgow !== undefined) {
    if (sv.glasgow <= 8) {
      alertas.push({
        tipo: 'critica',
        mensaje: `ALERTA: Glasgow = ${sv.glasgow}/15 — Deterioro grave de conciencia. Evaluar protección de vía aérea y causa neurológica.`,
        campo: 'glasgow',
        valor: sv.glasgow,
      });
    } else if (sv.glasgow < 13) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `PRECAUCIÓN: Glasgow = ${sv.glasgow}/15 — Deterioro moderado. Vigilar progresión y evaluar causa.`,
        campo: 'glasgow',
        valor: sv.glasgow,
      });
    }
  }

  // ── 10. Laboratorios críticos ────────────────────────────
  if (lab.potasio !== undefined) {
    if (lab.potasio >= 6.0) {
      alertas.push({
        tipo: 'critica',
        mensaje: `CRÍTICO: K⁺ = ${lab.potasio} mEq/L — Hiperpotasemia grave. Riesgo de arritmias cardíacas. Tratamiento urgente.`,
      });
    } else if (lab.potasio <= 2.5) {
      alertas.push({
        tipo: 'critica',
        mensaje: `CRÍTICO: K⁺ = ${lab.potasio} mEq/L — Hipopotasemia grave. Riesgo de arritmias. Reposición controlada urgente.`,
      });
    }
  }

  if (lab.glucosa !== undefined || sv.glucosaCapilar !== undefined) {
    const glucosa = lab.glucosa ?? sv.glucosaCapilar;
    if (glucosa && glucosa > 250) {
      alertas.push({
        tipo: 'critica',
        mensaje: `ALERTA: Glucosa = ${glucosa} mg/dL — Hiperglucemia grave. Evaluar cetoacidosis/hiperosmolar. Protocolo de insulina indicado.`,
      });
    } else if (glucosa && glucosa > 180) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `PRECAUCIÓN: Glucosa = ${glucosa} mg/dL — Hiperglucemia. En UCI meta glucémica 140-180 mg/dL. Monitorizar e iniciar protocolo si indicado.`,
      });
    } else if (glucosa && glucosa < 70) {
      alertas.push({
        tipo: 'critica',
        mensaje: `CRÍTICO: Glucosa = ${glucosa} mg/dL — Hipoglucemia. Corrección inmediata. Verificar causa y ajustar tratamiento.`,
      });
    }
  }

  if (lab.creatinina !== undefined && lab.creatinina > 2.0) {
    alertas.push({
      tipo: 'advertencia',
      mensaje: `PRECAUCIÓN: Creatinina = ${lab.creatinina} mg/dL — Elevada. Evaluar función renal, ajustar medicamentos nefrotóxicos y volumen.`,
    });
  }

  // ── 11. Diuresis ─────────────────────────────────────────
  if (sv.diuresisHora !== undefined) {
    if (sv.diuresisHora < 0.3) {
      alertas.push({
        tipo: 'critica',
        mensaje: `ALERTA: Diuresis = ${sv.diuresisHora} mL/kg/hr — Oliguria grave (< 0.3). Posible IRA. Evaluar hidratación, perfusión renal y causa.`,
        campo: 'diuresisHora',
        valor: sv.diuresisHora,
      });
    } else if (sv.diuresisHora < 0.5) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `PRECAUCIÓN: Diuresis = ${sv.diuresisHora} mL/kg/hr — Oliguria relativa. Vigilar tendencia y función renal.`,
        campo: 'diuresisHora',
        valor: sv.diuresisHora,
      });
    }
  }

  // ── 12. Riesgo por dispositivos invasivos ────────────────
  const diasDisp: string[] = [];
  if (disp.cvc?.presente && (disp.cvc.dias ?? 0) >= 7) {
    diasDisp.push(`CVC día ${disp.cvc.dias}`);
    alertas.push({
      tipo: 'advertencia',
      mensaje: `PRECAUCIÓN: CVC día ${disp.cvc.dias} — Riesgo acumulado de bacteriemia. Reevaluar necesidad y aplicar bundle de mantenimiento.`,
    });
  }
  if (disp.ventilacion_mecanica?.presente && (disp.ventilacion_mecanica.dias ?? 0) >= 5) {
    alertas.push({
      tipo: 'advertencia',
      mensaje: `PRECAUCIÓN: Ventilación mecánica día ${disp.ventilacion_mecanica.dias} — Riesgo acumulado de NAVM. Verificar bundle de prevención.`,
    });
  }
  if (disp.cateter_urinario?.presente && (disp.cateter_urinario.dias ?? 0) >= 5) {
    alertas.push({
      tipo: 'advertencia',
      mensaje: `PRECAUCIÓN: Catéter urinario día ${disp.cateter_urinario.dias} — Reevaluar necesidad. Aplicar bundle de prevención ITUAC.`,
    });
  }

  // ── 13. Temperatura crítica ──────────────────────────────
  if (sv.temperatura !== undefined) {
    if (sv.temperatura >= 39.5) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `PRECAUCIÓN: Temperatura = ${sv.temperatura}°C — Fiebre alta. Evaluar foco infeccioso, cultivos y tratamiento antipirético según indicación.`,
      });
    } else if (sv.temperatura < 35.5) {
      alertas.push({
        tipo: 'critica',
        mensaje: `ALERTA: Temperatura = ${sv.temperatura}°C — Hipotermia. Puede enmascarar sepsis. Evaluar y tratar causa.`,
      });
    }
  }

  // ── Determinar estado global del paciente ────────────────
  const tieneCritica = alertas.some(a => a.tipo === 'critica');
  const tieneAdvertencia = alertas.some(a => a.tipo === 'advertencia');

  let estadoPaciente: EstadoPaciente;
  if (tieneCritica) {
    estadoPaciente = 'CRITICO';
  } else if (tieneAdvertencia) {
    estadoPaciente = 'VIGILANCIA';
  } else if (camposFaltantes.length >= 4) {
    estadoPaciente = 'DESCONOCIDO';
  } else {
    estadoPaciente = 'ESTABLE';
  }

  return { alertas, estadoPaciente, camposFaltantes };
}
