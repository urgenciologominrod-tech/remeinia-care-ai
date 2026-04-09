// ============================================================
// REMEINIA Care AI — Tipos clínicos centrales
// ============================================================

export type EstadoPaciente = 'ESTABLE' | 'VIGILANCIA' | 'CRITICO' | 'DESCONOCIDO';
export type PrioridadClinica = 'INMEDIATA' | 'INTERMEDIA' | 'VIGILANCIA';
export type NivelConfianza = 'ALTA' | 'MEDIA' | 'BAJA' | 'INSUFICIENTE_DATOS';
export type NivelEvidencia = 'IA' | 'IB' | 'IIA' | 'IIB' | 'III' | 'IV' | 'GPP';
export type Sexo = 'MASCULINO' | 'FEMENINO' | 'OTRO' | 'NO_ESPECIFICADO';
export type RolUsuario = 'ENFERMERO' | 'SUPERVISOR' | 'ADMINISTRADOR' | 'REVISOR_REMEINIA';

// ─── Signos vitales ──────────────────────────────────────────
export interface SignosVitales {
  frecuenciaCardiaca?: number;
  frecuenciaRespir?: number;
  tensionArterialSis?: number;
  tensionArterialDias?: number;
  presionArterialMedia?: number;
  temperatura?: number;
  saturacionO2?: number;
  glucosaCapilar?: number;
  escalaDolor?: number;
  glasgow?: number;
  diuresisHora?: number;
}

// ─── Gasometría arterial ─────────────────────────────────────
export interface Gasometria {
  pH?: number;
  PaCO2?: number;
  PaO2?: number;
  HCO3?: number;
  SaO2?: number;
  Lactato?: number;
  PaFiO2?: number; // Calculado: PaO2 / FiO2
}

// ─── Ventilación mecánica ────────────────────────────────────
export interface ParametrosVentilador {
  activa: boolean;
  tipoO2?: string;
  modoVentilatorio?: string;
  fio2?: number;
  peep?: number;
  volumenTidal?: number;
  frProgramada?: number;
  presionPico?: number;
  presionPlateau?: number;
  secreciones?: string;
  musculosAccesorios?: boolean;
  sincroniaVentilador?: boolean;
}

// ─── Laboratorios ────────────────────────────────────────────
export interface Laboratorios {
  hemoglobina?: number;
  hematocrito?: number;
  leucocitos?: number;
  plaquetas?: number;
  sodio?: number;
  potasio?: number;
  cloro?: number;
  calcio?: number;
  magnesio?: number;
  creatinina?: number;
  urea?: number;
  bilirrubina_total?: number;
  pcr?: number;
  procalcitonina?: number;
  glucosa?: number;
  otros?: { nombre: string; valor: string; unidad: string }[];
}

// ─── Valoración por sistemas ─────────────────────────────────
export interface ValoracionSistemas {
  neurologico?: string;
  respiratorio?: string;
  cardiovascular?: string;
  renal?: string;
  gastrointestinal?: string;
  tegumentario?: string;
  dolor?: string;
  movilidad?: string;
  nutricion?: string;
  riesgo_infeccion?: string;
  riesgo_upp?: string;
  riesgo_caidas?: string;
  ansiedad_familia?: string;
}

// ─── Dispositivos e invasivos ────────────────────────────────
export interface DispositivosInvasivos {
  cvc?: { presente: boolean; dias?: number; sitio?: string; tipo?: string };
  cateter_urinario?: { presente: boolean; dias?: number; tipo?: string };
  sonda_enteral?: { presente: boolean; dias?: number; tipo?: string };
  ventilacion_mecanica?: { presente: boolean; dias?: number; modo?: string };
  sedacion?: { presente: boolean; farmaco?: string; objetivo_rass?: number };
  vasopresores?: { presente: boolean; farmaco?: string; dosis?: string; objetivo_pam?: number };
  drenajes?: { presente: boolean; tipo?: string; caracteristicas?: string };
  via_periferica?: { presente: boolean; sitio?: string };
  aislamiento?: { presente: boolean; tipo?: string };
  otros?: string[];
}

// ─── Alerta clínica ──────────────────────────────────────────
export interface AlertaClinica {
  tipo: 'critica' | 'advertencia' | 'informativa';
  mensaje: string;
  campo?: string;
  valor?: number | string;
  reglaId?: string;
}

// ─── Diagnóstico de enfermería sugerido ──────────────────────
export interface DiagnosticoEnfermeriaSugerido {
  codigo: string;
  etiqueta: string;
  prioridad: PrioridadClinica;
  factoresRelacionados?: string[];
  factoresRiesgo?: string[];
  manifestacionesClave?: string[];
  justificacion: string;
  confianza: NivelConfianza;
  evidenciaIds?: string[];
}

// ─── Resultado esperado (NOC-like) ───────────────────────────
export interface ResultadoSugerido {
  codigo: string;
  etiqueta: string;
  indicadores: string[];
  metaEsperada: string;
  relacionadoCon: string; // Código del diagnóstico
  confianza: NivelConfianza;
}

// ─── Intervención sugerida (NIC-like) ────────────────────────
export interface IntervencionSugerida {
  codigo: string;
  etiqueta: string;
  actividades: string[];
  frecuencia?: string;
  relacionadaCon: string; // Código del diagnóstico
  confianza: NivelConfianza;
}

// ─── Recomendación basada en guías ───────────────────────────
export interface RecomendacionGuia {
  recomendacion: string;
  fuente: string;
  nivelEvidencia: NivelEvidencia;
  fuerzaRecomendacion?: string;
  anio?: number;
  doi?: string;
  esFicticia: boolean; // Siempre marcar si es demo
}

// ─── Plan de cuidados completo ───────────────────────────────
export interface PlanCuidadosCompleto {
  resumenPaciente: string;
  explicacionDiagnostico: string; // Para enfermería, lenguaje claro
  generadoEn: string;
  esDemoFicticio: boolean;

  diagnosticos: DiagnosticoEnfermeriaSugerido[];
  resultados: ResultadoSugerido[];
  intervenciones: IntervencionSugerida[];
  recomendacionesGuias: RecomendacionGuia[];

  prioridadesInmediatas: string[];
  prioridadesIntermedias: string[];
  vigilanciaContinua: string[];

  alertas: AlertaClinica[];
  notasEnfermero?: string;
  avalaRemeinia?: boolean;
}

// ─── Resultado del motor clínico ─────────────────────────────
export interface ResultadoMotorClinico {
  estadoPaciente: EstadoPaciente;
  alertas: AlertaClinica[];
  plan: PlanCuidadosCompleto;
  camposFaltantes: string[];
  confianzaGlobal: NivelConfianza;
  advertenciaGeneral: string;
}

// ─── Valoración completa (formulario) ────────────────────────
export interface ValoracionFormData {
  // Paso 1
  inicialesPaciente: string;
  edad: number;
  sexo: Sexo;
  servicio: string;
  cama?: string;
  diagnosticoMedico: string;
  comorbilidades: string[];
  motivoAtencion: string;

  // Paso 2
  signosVitales: SignosVitales;

  // Pasos 3 y 4
  ventilacion: ParametrosVentilador;
  gasometria: Gasometria;

  // Paso 5
  laboratorios: Laboratorios;

  // Paso 6
  valoracionSistemas: ValoracionSistemas;

  // Paso 7
  dispositivos: DispositivosInvasivos;

  // Paso 8
  observaciones?: string;
  prioridadesPercibidas?: string;
}

// ─── Usuario del sistema ─────────────────────────────────────
export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  rol: RolUsuario;
  servicio?: string;
  cedula?: string;
  institucion?: string;
  activo: boolean;
}

// ─── Colores de semaforización clínica ──────────────────────
export const COLORES_ESTADO: Record<EstadoPaciente, { bg: string; text: string; border: string; label: string }> = {
  ESTABLE:     { bg: 'bg-success-100',  text: 'text-success-800',  border: 'border-success-300',  label: 'Estable' },
  VIGILANCIA:  { bg: 'bg-warning-100',  text: 'text-warning-800',  border: 'border-warning-300',  label: 'Vigilancia estrecha' },
  CRITICO:     { bg: 'bg-danger-100',   text: 'text-danger-800',   border: 'border-danger-300',   label: 'Crítico' },
  DESCONOCIDO: { bg: 'bg-gray-100',     text: 'text-gray-600',     border: 'border-gray-300',     label: 'Sin clasificar' },
};

export const COLORES_PRIORIDAD: Record<PrioridadClinica, { bg: string; text: string; label: string; dot: string }> = {
  INMEDIATA:   { bg: 'bg-danger-50',   text: 'text-danger-700',   label: 'Prioridad inmediata',   dot: 'bg-danger-500' },
  INTERMEDIA:  { bg: 'bg-warning-50',  text: 'text-warning-700',  label: 'Prioridad intermedia',  dot: 'bg-warning-500' },
  VIGILANCIA:  { bg: 'bg-clinical-50', text: 'text-clinical-700', label: 'Vigilancia continua',   dot: 'bg-clinical-400' },
};

export const COLORES_CONFIANZA: Record<NivelConfianza, { text: string; label: string }> = {
  ALTA:               { text: 'text-success-700',  label: 'Alta confianza' },
  MEDIA:              { text: 'text-warning-700',  label: 'Confianza media' },
  BAJA:               { text: 'text-danger-700',   label: 'Confianza baja' },
  INSUFICIENTE_DATOS: { text: 'text-gray-500',     label: 'Datos insuficientes' },
};

export const LABELS_EVIDENCIA: Record<NivelEvidencia, string> = {
  IA:  'Ia — Meta-análisis de ECA',
  IB:  'Ib — ECA bien diseñado',
  IIA: 'IIa — Estudio controlado',
  IIB: 'IIb — Cuasi-experimental',
  III: 'III — Estudio descriptivo',
  IV:  'IV — Consenso de expertos',
  GPP: 'GPP — Buenas prácticas',
};
