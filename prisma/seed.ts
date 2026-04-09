// ============================================================
// REMEINIA Care AI — Datos semilla (demo + configuración inicial)
// AVISO: Los pacientes demo son COMPLETAMENTE FICTICIOS.
// Solo con fines educativos y de demostración.
// ============================================================
import { PrismaClient, RolUsuario, Sexo, EstadoPaciente, NivelEvidencia } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando siembra de datos REMEINIA Care AI...');

  await prisma.configuracionSistema.upsert({
    where: { clave: 'app_nombre' },
    update: {},
    create: {
      clave: 'app_nombre',
      valor: 'REMEINIA Care AI',
      descripcion: 'Nombre de la aplicación',
    },
  });

  await prisma.configuracionSistema.upsert({
    where: { clave: 'modo_demo' },
    update: {},
    create: {
      clave: 'modo_demo',
      valor: 'true',
      descripcion: 'Habilitar modo demo con pacientes ficticios',
    },
  });

  await prisma.configuracionSistema.upsert({
    where: { clave: 'aviso_legal' },
    update: {},
    create: {
      clave: 'aviso_legal',
      valor:
        'REMEINIA Care AI es una herramienta de apoyo a la toma de decisiones clínicas. NO sustituye el juicio profesional de enfermería. Toda recomendación debe ser verificada y validada por el profesional de salud responsable. Información confidencial — uso exclusivo del personal autorizado.',
      descripcion: 'Texto del aviso legal en login',
    },
  });

  const adminHash = await bcrypt.hash('Admin2024!', 12);
  const enfermeraHash = await bcrypt.hash('Enfermera2024!', 12);
  const supervisorHash = await bcrypt.hash('Supervisor2024!', 12);
  const revisorHash = await bcrypt.hash('Revisor2024!', 12);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@remeinia.org' },
    update: {
      passwordHash: adminHash,
      activo: true,
    },
    create: {
      email: 'admin@remeinia.org',
      nombre: 'Administrador',
      apellidos: 'REMEINIA',
      passwordHash: adminHash,
      rol: RolUsuario.ADMINISTRADOR,
      servicio: 'Administración',
      institucion: 'REMEINIA',
      activo: true,
    },
  });

  const enfermera = await prisma.usuario.upsert({
    where: { email: 'enfermera.demo@remeinia.org' },
    update: {
      passwordHash: enfermeraHash,
      activo: true,
    },
    create: {
      email: 'enfermera.demo@remeinia.org',
      nombre: 'María Elena',
      apellidos: 'García Mendoza',
      passwordHash: enfermeraHash,
      rol: RolUsuario.ENFERMERO,
      servicio: 'Terapia Intensiva Adultos',
      cedula: '1234567',
      institucion: 'Hospital Demo',
      activo: true,
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'supervisor.demo@remeinia.org' },
    update: {
      passwordHash: supervisorHash,
      activo: true,
    },
    create: {
      email: 'supervisor.demo@remeinia.org',
      nombre: 'Carlos Alberto',
      apellidos: 'Rodríguez Pérez',
      passwordHash: supervisorHash,
      rol: RolUsuario.SUPERVISOR,
      servicio: 'Jefatura de Enfermería',
      cedula: '7654321',
      institucion: 'Hospital Demo',
      activo: true,
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'revisor@remeinia.org' },
    update: {
      passwordHash: revisorHash,
      activo: true,
    },
    create: {
      email: 'revisor@remeinia.org',
      nombre: 'Dra. Lucía',
      apellidos: 'Martínez Fuentes',
      passwordHash: revisorHash,
      rol: RolUsuario.REVISOR_REMEINIA,
      servicio: 'Comité Académico REMEINIA',
      institucion: 'REMEINIA',
      activo: true,
    },
  });

  const diagnosticosDemo = [
    {
      codigo: 'DEMO-001',
      etiqueta: 'Deterioro del intercambio gaseoso',
      dominio: 'Actividad/Reposo',
      clase: 'Respuesta cardiovascular/pulmonar',
      definicionCorta:
        'Exceso o déficit en la oxigenación o eliminación de dióxido de carbono en la membrana alveolocapilar.',
      factoresRelacionados: [
        'Desequilibrio ventilación-perfusión',
        'Cambios en la membrana alveolocapilar',
      ],
      caracteristicasDefinitorias: [
        'SpO2 < 90%',
        'PaO2 disminuida',
        'PaCO2 alterada',
        'pH anormal',
        'Uso de músculos accesorios',
        'Disnea',
      ],
      factoresRiesgo: [],
      notas: 'DATO DEMO FICTICIO — Solo para demostración del sistema',
    },
    {
      codigo: 'DEMO-002',
      etiqueta: 'Patrón respiratorio ineficaz',
      dominio: 'Actividad/Reposo',
      clase: 'Respuesta cardiovascular/pulmonar',
      definicionCorta:
        'La inspiración o espiración no proporciona una ventilación adecuada.',
      factoresRelacionados: [
        'Fatiga de los músculos respiratorios',
        'Dolor',
        'Ansiedad',
        'Posición corporal que inhibe la expansión pulmonar',
      ],
      caracteristicasDefinitorias: [
        'FR alterada',
        'Uso de músculos accesorios',
        'Ortopnea',
        'Reducción de la capacidad vital',
      ],
      factoresRiesgo: [],
      notas: 'DATO DEMO FICTICIO — Solo para demostración del sistema',
    },
    {
      codigo: 'DEMO-003',
      etiqueta: 'Riesgo de infección',
      dominio: 'Seguridad/Protección',
      clase: 'Infección',
      definicionCorta:
        'Susceptibilidad a ser invadido y multiplicado por organismos patógenos.',
      factoresRelacionados: [],
      caracteristicasDefinitorias: [],
      factoresRiesgo: [
        'Procedimientos invasivos',
        'Conocimiento insuficiente para evitar exposición a patógenos',
        'Alteración de la integridad cutánea',
        'Inmunosupresión',
      ],
      notas: 'DATO DEMO FICTICIO — Solo para demostración del sistema',
    },
    {
      codigo: 'DEMO-004',
      etiqueta: 'Perfusión tisular periférica ineficaz',
      dominio: 'Actividad/Reposo',
      clase: 'Respuesta cardiovascular/pulmonar',
      definicionCorta:
        'Disminución de la circulación sanguínea periférica que puede comprometer la salud.',
      factoresRelacionados: ['Hipovolemia', 'Vasoespasmo', 'Hipotensión'],
      caracteristicasDefinitorias: [
        'PAM < 65 mmHg',
        'Llenado capilar > 2 seg',
        'Lactato elevado',
        'Frialdad distal',
      ],
      factoresRiesgo: [],
      notas: 'DATO DEMO FICTICIO — Solo para demostración del sistema',
    },
    {
      codigo: 'DEMO-005',
      etiqueta: 'Dolor agudo',
      dominio: 'Confort',
      clase: 'Confort físico',
      definicionCorta:
        'Experiencia sensitiva y emocional desagradable asociada a daño tisular real o potencial de inicio súbito.',
      factoresRelacionados: [
        'Agentes lesivos biológicos',
        'Agentes lesivos físicos',
        'Agentes lesivos químicos',
      ],
      caracteristicasDefinitorias: [
        'Escala de dolor ≥ 4',
        'Expresión facial de dolor',
        'Cambios en signos vitales',
        'Conducta protectora',
      ],
      factoresRiesgo: [],
      notas: 'DATO DEMO FICTICIO — Solo para demostración del sistema',
    },
    {
      codigo: 'DEMO-006',
      etiqueta: 'Riesgo de lesión por presión',
      dominio: 'Seguridad/Protección',
      clase: 'Lesión física',
      definicionCorta:
        'Susceptibilidad a una lesión localizada en la piel o tejidos subyacentes.',
      factoresRelacionados: [],
      caracteristicasDefinitorias: [],
      factoresRiesgo: [
        'Inmovilidad',
        'Humedad',
        'Presión prolongada',
        'Nutrición inadecuada',
        'Dispositivos médicos',
      ],
      notas: 'DATO DEMO FICTICIO — Solo para demostración del sistema',
    },
  ];

  for (const diag of diagnosticosDemo) {
    await prisma.catalogoDiagnostico.upsert({
      where: { codigo: diag.codigo },
      update: {},
      create: { ...diag, esDemoFicticio: true },
    });
  }

  const resultadosDemo = [
    {
      codigo: 'DEMO-NOC-001',
      etiqueta: 'Estado respiratorio: intercambio gaseoso',
      dominio: 'Salud fisiológica',
      clase: 'Cardiopulmonar',
      definicionCorta:
        'Intercambio alveolar de CO2 y O2 para mantener la concentración de gases en sangre arterial.',
      indicadores: [
        'SpO2 ≥ 94%',
        'PaO2 en rango normal',
        'pH arterial 7.35-7.45',
        'FR 12-20 rpm',
        'Ausencia de uso de músculos accesorios',
      ],
      escalaDefault:
        'Escala 1-5: 1=Gravemente comprometido, 5=No comprometido. Meta: ≥ 4',
    },
    {
      codigo: 'DEMO-NOC-002',
      etiqueta: 'Perfusión tisular: periférica',
      dominio: 'Salud fisiológica',
      clase: 'Cardiopulmonar',
      definicionCorta:
        'Flujo sanguíneo adecuado a través de los vasos de la circulación periférica.',
      indicadores: [
        'PAM ≥ 65 mmHg',
        'Lactato < 2 mmol/L',
        'Llenado capilar < 2 seg',
        'Diuresis ≥ 0.5 mL/kg/hr',
      ],
      escalaDefault:
        'Escala 1-5: 1=Gravemente comprometido, 5=No comprometido. Meta: ≥ 3',
    },
    {
      codigo: 'DEMO-NOC-003',
      etiqueta: 'Control del dolor',
      dominio: 'Salud percibida',
      clase: 'Estado de salud sintomático',
      definicionCorta: 'Acciones personales para controlar el dolor.',
      indicadores: [
        'Escala EVA ≤ 3',
        'Reconoce factores causales',
        'Usa medidas de alivio del dolor',
      ],
      escalaDefault:
        'Escala 1-5: 1=No demostrado, 5=Totalmente demostrado. Meta: ≥ 4',
    },
    {
      codigo: 'DEMO-NOC-004',
      etiqueta: 'Severidad de la infección',
      dominio: 'Estado de salud funcional',
      clase: 'Respuesta inmune',
      definicionCorta: 'Severidad de los signos y síntomas de una infección.',
      indicadores: [
        'Temperatura 36-38°C',
        'Leucocitos 4000-11000',
        'PCR en descenso',
        'Cultivos negativos o controlados',
      ],
      escalaDefault: 'Escala 1-5: 1=Grave, 5=Ninguno. Meta: ≥ 3',
    },
  ];

  for (const res of resultadosDemo) {
    await prisma.catalogoResultado.upsert({
      where: { codigo: res.codigo },
      update: {},
      create: { ...res, esDemoFicticio: true },
    });
  }

  const intervencionesDemo = [
    {
      codigo: 'DEMO-NIC-001',
      etiqueta: 'Manejo de la vía aérea',
      campo: 'Fisiológico básico',
      clase: 'Control respiratorio',
      definicionCorta: 'Facilitar la permeabilidad de la vía aérea.',
      actividades: [
        'Colocar al paciente con la cabecera elevada 30-45° si no está contraindicado',
        'Aspirar secreciones según necesidad y técnica estéril',
        'Monitorizar FR, SpO2 y patrón respiratorio cada hora',
        'Evaluar sincronía paciente-ventilador',
        'Verificar posicionamiento del tubo endotraqueal',
        'Registrar características de las secreciones',
      ],
      frecuenciaOrient: 'Continua / cada turno',
    },
    {
      codigo: 'DEMO-NIC-002',
      etiqueta: 'Monitorización respiratoria',
      campo: 'Fisiológico complejo',
      clase: 'Control respiratorio',
      definicionCorta:
        'Recopilación y análisis de datos del paciente para asegurar la permeabilidad de la vía aérea y el intercambio de gases.',
      actividades: [
        'Monitorizar FR, ritmo, profundidad y esfuerzo respiratorio',
        'Monitorizar SpO2 de forma continua',
        'Evaluar movimientos torácicos bilaterales',
        'Vigilar resultados de gasometría arterial',
        'Monitorizar parámetros del ventilador según protocolo',
        'Alertar al médico ante deterioro',
      ],
      frecuenciaOrient: 'Continua',
    },
    {
      codigo: 'DEMO-NIC-003',
      etiqueta: 'Manejo del dolor',
      campo: 'Fisiológico básico',
      clase: 'Control del confort físico',
      definicionCorta:
        'Alivio del dolor o disminución del dolor a un nivel de confort aceptable para el paciente.',
      actividades: [
        'Evaluar dolor con escala validada (EVA, CPOT) cada 4 horas o PRN',
        'Administrar analgésicos según prescripción médica',
        'Documentar respuesta al tratamiento analgésico',
        'Explorar técnicas no farmacológicas: posición, música, calor/frío',
        'Informar al paciente/familia sobre el manejo del dolor',
      ],
      frecuenciaOrient: 'Cada 4 horas / PRN',
    },
    {
      codigo: 'DEMO-NIC-004',
      etiqueta: 'Prevención de infecciones',
      campo: 'Seguridad',
      clase: 'Control de riesgos',
      definicionCorta:
        'Prevención y detección precoz de infecciones en pacientes de riesgo.',
      actividades: [
        'Higiene de manos con 5 momentos de la OMS',
        'Mantenimiento de técnica aséptica en procedimientos invasivos',
        'Cuidados de catéter venoso central según bundle institucional',
        'Cuidados de sonda vesical para prevención de IAAS',
        'Vigilar signos de infección: fiebre, eritema, secreción purulenta',
        'Registrar días de dispositivo invasivo',
      ],
      frecuenciaOrient: 'Cada turno',
    },
    {
      codigo: 'DEMO-NIC-005',
      etiqueta: 'Cuidados circulatorios: insuficiencia arterial',
      campo: 'Fisiológico básico',
      clase: 'Control de la perfusión tisular',
      definicionCorta: 'Fomento de la circulación arterial.',
      actividades: [
        'Monitorizar PAM continuamente',
        'Valorar llenado capilar y temperatura distal',
        'Monitorizar lactato sérico',
        'Mantener perfusión de vasopresores según prescripción',
        'Evaluar cambios en estado neurológico',
        'Registrar diuresis horaria',
      ],
      frecuenciaOrient: 'Continua',
    },
  ];

  for (const int_ of intervencionesDemo) {
    await prisma.catalogoIntervencion.upsert({
      where: { codigo: int_.codigo },
      update: {},
      create: { ...int_, esDemoFicticio: true },
    });
  }

  const evidenciasDemo = [
    {
      titulo:
        '[DEMO] Guía de práctica clínica para el manejo del síndrome de dificultad respiratoria aguda (SDRA)',
      tipoFuente: 'Guía clínica',
      organizacion: 'Ejemplo organizacion internacional (DEMO)',
      anio: 2023,
      doi: '10.0000/ejemplo.demo.2023',
      resumenUtilidad:
        'DATO DEMO FICTICIO. En una guía real se resumiría la utilidad clínica para la práctica de enfermería, incluyendo parámetros de ventilación protectora, posición prono y monitoreo recomendado.',
      nivelEvidencia: NivelEvidencia.IA,
      fuerzaRecomend: 'Fuerte',
      palabrasClave: ['SDRA', 'ventilación mecánica', 'PEEP', 'PaFiO2'],
      esFicticio: true,
    },
    {
      titulo:
        '[DEMO] Bundles para prevención de infecciones asociadas a dispositivos en UCI',
      tipoFuente: 'Revisión sistemática',
      organizacion: 'Ejemplo agencia de seguridad del paciente (DEMO)',
      anio: 2022,
      doi: '10.0000/ejemplo.demo.2022',
      resumenUtilidad:
        'DATO DEMO FICTICIO. Describe paquetes de medidas para prevención de NAVM, ITUAC y bacteriemia por catéter central.',
      nivelEvidencia: NivelEvidencia.IB,
      fuerzaRecomend: 'Fuerte',
      palabrasClave: ['bundle', 'prevención IAAS', 'catéter venoso central', 'UCI'],
      esFicticio: true,
    },
    {
      titulo:
        '[DEMO] Manejo del dolor, agitación y delirium en pacientes críticos',
      tipoFuente: 'Guía clínica',
      organizacion: 'Ejemplo sociedad de cuidados críticos (DEMO)',
      anio: 2023,
      doi: '10.0000/ejemplo.demo.dad.2023',
      resumenUtilidad:
        'DATO DEMO FICTICIO. Evalúa escalas validadas (CPOT, RASS, CAM-ICU) y estrategias multimodales para control de síntomas en UCI.',
      nivelEvidencia: NivelEvidencia.IB,
      fuerzaRecomend: 'Fuerte',
      palabrasClave: ['dolor', 'agitación', 'delirium', 'UCI', 'CPOT', 'RASS'],
      esFicticio: true,
    },
  ];

  for (const ev of evidenciasDemo) {
    await prisma.evidenciaClinica.create({ data: ev }).catch(() => {});
  }

  const reglasIniciales = [
    {
      nombre: 'Hipoxemia crítica',
      descripcion: 'Alerta cuando SpO2 es menor a 90%',
      categoria: 'alerta_vital',
      condicion: { campo: 'saturacionO2', operador: '<', valor: 90 },
      mensajeAlerta:
        'ALERTA: SpO2 < 90% — Deterioro oxigenación. Verificar vía aérea y oxigenoterapia de inmediato.',
      prioridad: 1,
    },
    {
      nombre: 'Hipoperfusión — Lactato elevado',
      descripcion: 'Alerta cuando el lactato sérico supera 2 mmol/L',
      categoria: 'riesgo_sepsis',
      condicion: { campo: 'gaso_Lactato', operador: '>', valor: 2 },
      mensajeAlerta:
        'ALERTA: Lactato > 2 mmol/L — Posible hipoperfusión tisular o hipoxia. Evaluar síndrome séptico.',
      prioridad: 1,
    },
    {
      nombre: 'SDRA severo — PaFiO2',
      descripcion: 'PaO2/FiO2 < 150 sugiere SDRA moderado-severo',
      categoria: 'ventilacion',
      condicion: { campo: 'gaso_PaFiO2', operador: '<', valor: 150 },
      mensajeAlerta:
        'ALERTA: PaFiO2 < 150 — Compatible con SDRA moderado/severo. Revisar estrategia ventilatoria protectora.',
      prioridad: 1,
    },
    {
      nombre: 'PAM comprometida',
      descripcion: 'PAM menor a 65 mmHg indica hipoperfusión orgánica',
      categoria: 'alerta_vital',
      condicion: { campo: 'presionArterialMedia', operador: '<', valor: 65 },
      mensajeAlerta:
        'ALERTA: PAM < 65 mmHg — Riesgo de hipoperfusión orgánica. Evaluar soporte vasopresor y volumen.',
      prioridad: 1,
    },
    {
      nombre: 'Riesgo de sepsis — criterios SIRS',
      descripcion: 'Temperatura > 38.3°C o < 36°C con FC > 90 o FR > 20',
      categoria: 'riesgo_sepsis',
      condicion: {
        tipo: 'compuesto',
        logica: 'Y',
        campos: [
          { campo: 'temperatura', operador: '>', valor: 38.3 },
          { campo: 'frecuenciaCardiaca', operador: '>', valor: 90 },
        ],
      },
      mensajeAlerta:
        'PRECAUCIÓN: Criterios compatibles con respuesta inflamatoria sistémica. Evaluar foco infeccioso y sepsis.',
      prioridad: 2,
    },
    {
      nombre: 'Glasgow bajo',
      descripcion: 'Glasgow ≤ 8 indica alteración grave de conciencia',
      categoria: 'alerta_vital',
      condicion: { campo: 'glasgow', operador: '<=', valor: 8 },
      mensajeAlerta:
        'ALERTA: Glasgow ≤ 8 — Alteración grave del estado de conciencia. Valorar protección de vía aérea.',
      prioridad: 1,
    },
    {
      nombre: 'Hiperglucemia crítica',
      descripcion: 'Glucosa capilar > 180 mg/dL en UCI',
      categoria: 'alerta_metabolica',
      condicion: { campo: 'glucosaCapilar', operador: '>', valor: 180 },
      mensajeAlerta:
        'PRECAUCIÓN: Glucosa > 180 mg/dL — Hiperglucemia. Evaluar protocolo de insulina según indicación médica.',
      prioridad: 3,
    },
    {
      nombre: 'Datos insuficientes para análisis confiable',
      descripcion: 'Cuando faltan más de 3 campos esenciales',
      categoria: 'calidad_datos',
      condicion: { tipo: 'campos_faltantes', minimo_requerido: 5 },
      mensajeAlerta:
        'AVISO: Datos clínicos insuficientes para sugerencias de alta confianza. Completar valoración para mayor precisión.',
      prioridad: 5,
    },
  ];

  for (const regla of reglasIniciales) {
    await prisma.reglaClinica.create({ data: regla }).catch(() => {});
  }

  const val1 = await prisma.valoracion.upsert({
    where: { folio: 'DEMO-2024-001' },
    update: {},
    create: {
      folio: 'DEMO-2024-001',
      inicialesPaciente: 'J.M.L.',
      edad: 58,
      sexo: Sexo.MASCULINO,
      servicio: 'UCI Adultos',
      cama: '04',
      diagnosticoMedico:
        'Síndrome de Dificultad Respiratoria Aguda (SDRA) moderado secundario a neumonía bilateral por SARS-CoV-2',
      comorbilidades: [
        'Diabetes mellitus tipo 2',
        'Hipertensión arterial sistémica',
        'Obesidad grado II',
      ],
      motivoAtencion:
        'Ingresa por disnea progresiva de 5 días, fiebre y desaturación refractaria a oxígeno convencional',
      esDemo: true,
      frecuenciaCardiaca: 108,
      frecuenciaRespir: 28,
      tensionArterialSis: 118,
      tensionArterialDias: 72,
      presionArterialMedia: 87,
      temperatura: 38.6,
      saturacionO2: 91,
      glucosaCapilar: 210,
      escalaDolor: 3,
      glasgow: 13,
      diuresisHora: 0.4,
      gaso_pH: 7.32,
      gaso_PaCO2: 48,
      gaso_PaO2: 68,
      gaso_HCO3: 24.5,
      gaso_SaO2: 91,
      gaso_Lactato: 1.8,
      gaso_PaFiO2: 136,
      ventilacionMecanica: true,
      tipoO2: 'Ventilación mecánica invasiva (VMI)',
      modoVentilatorio: 'VCV (Ventilación Controlada por Volumen)',
      fio2: 0.5,
      peep: 10,
      volumenTidal: 420,
      frProgramada: 20,
      presionPico: 32,
      presionPlateau: 26,
      secreciones: 'Abundantes, espesas, blanquecinas',
      musculosAccesorios: true,
      sincroniaVentilador: true,
      laboratorios: {
        hemoglobina: 11.2,
        hematocrito: 34,
        leucocitos: 14800,
        plaquetas: 198000,
        sodio: 138,
        potasio: 4.1,
        cloro: 102,
        calcio: 8.6,
        magnesio: 1.8,
        creatinina: 1.3,
        urea: 45,
        bilirrubina_total: 1.1,
        pcr: 186,
        procalcitonina: 2.8,
        glucosa: 205,
      },
      valoracionSistemas: {
        neurologico:
          'Glasgow 13 (O3 V4 M6). Sedoanalgesia ligera (RASS -1). Sin focalidades.',
        respiratorio:
          'Estertores crepitantes bilaterales. Ventilación mecánica invasiva. Sincronía adecuada. Secreciones abundantes espesas blanquecinas.',
        cardiovascular:
          'Ritmo sinusal. FC 108 lpm. Sin arritmias. Llenado capilar 2 seg. Extremidades tibias.',
        renal: 'Diuresis 0.4 mL/kg/hr. Creatinina 1.3. Oliguria relativa.',
        gastrointestinal:
          'Abdomen globoso por obesidad. Peristaltismo presente. Dieta suspendida. Sonda enteral en posición.',
        tegumentario:
          'Sin lesiones por presión activas. Riesgo alto por inmovilidad y dispositivos.',
        dolor: 'CPOT 3/8. Bajo sedoanalgesia. Manejo multimodal.',
        movilidad:
          'Encamado. Giro 30° cada 2 horas. Fisioterapia pendiente.',
        nutricion:
          'NPO. Inicio de nutrición enteral programado. Glucosa 205. Requiere protocolo insulina.',
        riesgo_infeccion:
          'CVC 3 días. TET 2 días. NAVM y bacteriemia son riesgos principales.',
        riesgo_upp:
          'Braden 11 — alto riesgo. Inmovilidad, humedad, nutrición comprometida.',
        riesgo_caidas: 'Sin riesgo activo por inmovilidad.',
        ansiedad_familia:
          'Familia angustiada. Requiere orientación e información actualizada.',
      },
      dispositivos: {
        cvc: {
          presente: true,
          dias: 3,
          sitio: 'Yugular interna derecha',
          tipo: 'Triple lumen',
        },
        cateter_urinario: { presente: true, dias: 4, tipo: 'Foley' },
        sonda_enteral: { presente: true, dias: 1, tipo: 'SNG' },
        ventilacion_mecanica: { presente: true, modo: 'VCV', dias: 2 },
        sedacion: {
          presente: true,
          farmaco: 'Propofol + Fentanilo',
          objetivo_rass: -1,
        },
        vasopresores: { presente: false },
        aislamiento: {
          presente: true,
          tipo: 'Precauciones por gotas y contacto',
        },
      },
      observaciones:
        'PACIENTE DEMO FICTICIO — Solo para demostración del sistema. Paciente masculino de 58 años con SDRA moderado en ventilación mecánica. Presenta insuficiencia respiratoria progresiva, hiperglucemia y oliguria relativa. Riesgo elevado de NAVM y bacteriemia por dispositivos. Familia requiere apoyo e información.',
      prioridadesPercibidas:
        'Mantener oxigenación adecuada. Prevenir complicaciones de VM. Control glucémico. Prevención de IAAS. Movilización precoz.',
      estadoPaciente: EstadoPaciente.CRITICO,
      alertasActivas: [
        {
          tipo: 'critica',
          mensaje: 'PaFiO2 = 136 — SDRA moderado. Revisar ventilación protectora.',
        },
        {
          tipo: 'critica',
          mensaje:
            'SpO2 = 91% con FiO2 50% — Deterioro del intercambio gaseoso.',
        },
        {
          tipo: 'advertencia',
          mensaje: 'Lactato 1.8 — Monitorizar tendencia.',
        },
        {
          tipo: 'advertencia',
          mensaje:
            'Glucosa 210 mg/dL — Iniciar protocolo de insulina.',
        },
        {
          tipo: 'advertencia',
          mensaje:
            'Diuresis 0.4 mL/kg/hr — Oliguria relativa. Vigilar función renal.',
        },
        {
          tipo: 'informativa',
          mensaje: 'CVC día 3 + TET día 2 — Aplicar bundles de prevención IAAS.',
        },
      ],
      creadoPor: enfermera.id,
    },
  });

  const val2 = await prisma.valoracion.upsert({
    where: { folio: 'DEMO-2024-002' },
    update: {},
    create: {
      folio: 'DEMO-2024-002',
      inicialesPaciente: 'R.O.T.',
      edad: 72,
      sexo: Sexo.FEMENINO,
      servicio: 'Urgencias Adultos',
      cama: 'U-07',
      diagnosticoMedico:
        'Sepsis de foco urinario — urosepsis por E. coli (dato ficticio demo)',
      comorbilidades: [
        'Diabetes mellitus tipo 2',
        'Insuficiencia renal crónica estadio III',
        'Hipertensión arterial',
      ],
      motivoAtencion:
        'Fiebre de 39°C, disuria, hematuria macroscópica, confusión y deterioro del estado general de 2 días de evolución',
      esDemo: true,
      frecuenciaCardiaca: 118,
      frecuenciaRespir: 24,
      tensionArterialSis: 88,
      tensionArterialDias: 55,
      presionArterialMedia: 66,
      temperatura: 39.2,
      saturacionO2: 93,
      glucosaCapilar: 285,
      escalaDolor: 6,
      glasgow: 12,
      diuresisHora: 0.2,
      gaso_pH: 7.28,
      gaso_PaCO2: 32,
      gaso_PaO2: 78,
      gaso_HCO3: 15,
      gaso_SaO2: 95,
      gaso_Lactato: 3.2,
      gaso_PaFiO2: 371,
      ventilacionMecanica: false,
      tipoO2: 'Mascarilla de reinhalación 10 L/min',
      laboratorios: {
        hemoglobina: 9.8,
        hematocrito: 30,
        leucocitos: 22400,
        plaquetas: 88000,
        sodio: 132,
        potasio: 5.2,
        cloro: 98,
        calcio: 7.9,
        creatinina: 2.8,
        urea: 92,
        bilirrubina_total: 1.6,
        pcr: 312,
        procalcitonina: 18.6,
        glucosa: 289,
      },
      valoracionSistemas: {
        neurologico:
          'Glasgow 12 (O3 V4 M5). Confusión. Desorientada en tiempo y espacio.',
        respiratorio:
          'Taquipnea 24 rpm. Murmullo vesicular disminuido bases. Oxigenoterapia con mascarilla.',
        cardiovascular:
          'Taquicardia sinusal 118 lpm. TA 88/55. PAM 66. Llenado capilar 3 seg. Frialdad distal.',
        renal:
          'Oliguria grave 0.2 mL/kg/hr. Creatinina 2.8 (basal 1.6). IRA sobreagregada. Orina turbia.',
        gastrointestinal:
          'Dolor hipogástrico. Sin datos de irritación peritoneal. Tolera vía oral limitada.',
        tegumentario: 'Piel diaforética y pálida. Sin lesiones activas.',
        dolor: 'EVA 6/10. Dolor hipogástrico y lumbar.',
        movilidad:
          'Deambulación limitada por malestar. Riesgo de caída elevado.',
        nutricion: 'Ingesta oral deficiente últimas 48 hrs.',
        riesgo_infeccion:
          'Fuente identificada: urinaria. Urocultivo pendiente. Hemocultivos tomados.',
        riesgo_upp: 'Braden 14 — Riesgo moderado.',
        riesgo_caidas:
          'Downton 4 — Riesgo alto por confusión y debilidad.',
        ansiedad_familia: 'Familiar acompañante, muy angustiado.',
      },
      dispositivos: {
        cvc: {
          presente: true,
          dias: 0,
          sitio: 'Subclavia izquierda',
          tipo: 'Doble lumen — colocado en urgencias',
        },
        cateter_urinario: {
          presente: true,
          dias: 0,
          tipo: 'Foley — colocado en urgencias',
        },
        vasopresores: {
          presente: true,
          farmaco: 'Norepinefrina 0.08 mcg/kg/min',
          objetivo_pam: 65,
        },
        aislamiento: { presente: false },
      },
      observaciones:
        'PACIENTE DEMO FICTICIO — Solo para demostración. Paciente femenina 72 años con urosepsis, lactato 3.2, PAM limítrofe con norepinefrina, IRA aguda sobreagregada a IRC, hiperglucemia severa y confusión. Hora cero del paquete sepsis en progreso.',
      prioridadesPercibidas:
        'Estabilidad hemodinámica. Control glucémico urgente. Diuresis. Antibióticoterapia dirigida pendiente. Prevención de deterioro neurológico.',
      estadoPaciente: EstadoPaciente.CRITICO,
      alertasActivas: [
        {
          tipo: 'critica',
          mensaje:
            'Lactato 3.2 mmol/L — Hipoperfusión tisular significativa. Activar bundle de sepsis.',
        },
        {
          tipo: 'critica',
          mensaje:
            'Glucosa 285 mg/dL — Hiperglucemia grave. Protocolo de insulina urgente.',
        },
        {
          tipo: 'critica',
          mensaje:
            'Oliguria grave 0.2 mL/kg/hr — IRA aguda. Vigilar electrolitos.',
        },
        {
          tipo: 'advertencia',
          mensaje:
            'PAM 66 mmHg con norepinefrina — Monitorizar perfusión orgánica.',
        },
        {
          tipo: 'advertencia',
          mensaje:
            'Plaquetas 88,000 — Trombocitopenia en contexto séptico.',
        },
        {
          tipo: 'advertencia',
          mensaje: 'Glasgow 12 — Vigilar deterioro neurológico.',
        },
      ],
      creadoPor: enfermera.id,
    },
  });

  const val3 = await prisma.valoracion.upsert({
    where: { folio: 'DEMO-2024-003' },
    update: {},
    create: {
      folio: 'DEMO-2024-003',
      inicialesPaciente: 'A.S.M.',
      edad: 45,
      sexo: Sexo.MASCULINO,
      servicio: 'Hospitalización Cirugía General',
      cama: 'C-212',
      diagnosticoMedico:
        'Posoperatorio de hemicolectomía derecha laparoscópica por adenocarcinoma de colon ascendente (estadio II, dato ficticio)',
      comorbilidades: ['Hipertensión arterial', 'Obesidad grado I'],
      motivoAtencion:
        'Control posquirúrgico 24 horas. Dolor moderado, movilidad limitada, nausea.',
      esDemo: true,
      frecuenciaCardiaca: 92,
      frecuenciaRespir: 18,
      tensionArterialSis: 132,
      tensionArterialDias: 84,
      presionArterialMedia: 100,
      temperatura: 37.8,
      saturacionO2: 96,
      glucosaCapilar: 128,
      escalaDolor: 7,
      glasgow: 15,
      diuresisHora: 1.1,
      ventilacionMecanica: false,
      tipoO2: 'Puntas nasales 2 L/min',
      laboratorios: {
        hemoglobina: 10.8,
        hematocrito: 32,
        leucocitos: 12600,
        plaquetas: 245000,
        sodio: 139,
        potasio: 3.6,
        creatinina: 0.9,
        urea: 28,
        pcr: 48,
        glucosa: 131,
      },
      valoracionSistemas: {
        neurologico:
          'Glasgow 15. Orientado. Somnoliento por opiáceos. Sin focalidades.',
        respiratorio:
          'Respiración superficial por dolor. Auscultación con murmullo vesicular presente. SpO2 96%. Tos ineficaz.',
        cardiovascular:
          'Ritmo sinusal. TA 132/84. Sin arritmias. Adecuada perfusión periférica.',
        renal: 'Diuresis conservada. Sonda Foley para control.',
        gastrointestinal:
          'Abdomen quirúrgico. Herida laparoscópica (5 trócares). Sin salida de drenaje activo. Peristaltismo ausente. NPO.',
        tegumentario:
          'Herida quirúrgica limpia. Sin signos de infección. Apósito íntegro.',
        dolor:
          'EVA 7/10 en reposo, 9/10 al movimiento. Dificulta respiración profunda y movilización.',
        movilidad:
          'En cama. Cambios posturales asistidos. No deambulación aún. Fisioterapia programada mañana.',
        nutricion:
          'NPO. Inicio dieta líquida al reinicio del tránsito. Catabolismo posquirúrgico.',
        riesgo_infeccion:
          'Herida quirúrgica + catéter urinario + vía venosa periférica.',
        riesgo_upp:
          'Braden 16 — Riesgo bajo-moderado. Inmovilidad 24h posop.',
        riesgo_caidas:
          'Elevado por opiáceos + primera movilización.',
        ansiedad_familia:
          'Paciente ansioso por diagnóstico oncológico subyacente. Requiere apoyo emocional.',
      },
      dispositivos: {
        cateter_urinario: { presente: true, dias: 1, tipo: 'Foley' },
        drenajes: {
          presente: true,
          tipo: 'Drenaje lámina Jackson Pratt en fosa iliaca derecha',
          caracteristicas: 'Gasto mínimo serosanguinolento',
        },
        via_periferica: {
          presente: true,
          sitio: 'Antebrazo izquierdo',
        },
      },
      observaciones:
        'PACIENTE DEMO FICTICIO — Solo para demostración. Posoperatorio 24h de hemicolectomía. Dolor mal controlado que limita respiración profunda y movilización. Riesgo de infección de herida. Íleo adinámico esperado. Ansiedad por diagnóstico oncológico.',
      prioridadesPercibidas:
        'Control del dolor. Prevención de complicaciones pulmonares (respiración superficial). Vigilancia de herida. Movilización precoz. Apoyo emocional.',
      estadoPaciente: EstadoPaciente.VIGILANCIA,
      alertasActivas: [
        {
          tipo: 'advertencia',
          mensaje:
            'Dolor EVA 7/10 — Analgesia insuficiente. Riesgo de complicaciones pulmonares por inmovilización.',
        },
        {
          tipo: 'advertencia',
          mensaje:
            'Respiración superficial por dolor — Riesgo de atelectasias.',
        },
        {
          tipo: 'informativa',
          mensaje: 'Íleo posquirúrgico esperado — Vigilar reinicio de tránsito.',
        },
        {
          tipo: 'informativa',
          mensaje:
            'Catéter urinario día 1 — Plan retiro mañana según indicación médica.',
        },
      ],
      creadoPor: enfermera.id,
    },
  });

  await prisma.planCuidados.upsert({
    where: { valoracionId: val1.id },
    update: {},
    create: {
      valoracionId: val1.id,
      creadoPor: enfermera.id,
      notasEnfermero:
        'DATO DEMO. Plan generado automáticamente para demostración del sistema.',
      contenido: {
        resumenPaciente:
          'Paciente masculino de 58 años con SDRA moderado en VMI. Múltiples comorbilidades. Estado crítico.',
        generadoEn: new Date().toISOString(),
        esDemoFicticio: true,
        diagnosticos: [
          {
            codigo: 'DEMO-001',
            etiqueta: 'Deterioro del intercambio gaseoso',
            prioridad: 'INMEDIATA',
            factoresRelacionados: [
              'Cambios en la membrana alveolocapilar por proceso infeccioso',
              'Desequilibrio ventilación-perfusión',
            ],
            manifestacionesClave: [
              'SpO2 91% con FiO2 50%',
              'PaFiO2 = 136',
              'pH 7.32',
              'PaCO2 48 mmHg',
              'Uso de músculos accesorios',
            ],
            justificacion:
              'PaFiO2 de 136 y SpO2 de 91% con FiO2 al 50% confirman deterioro significativo del intercambio gaseoso, compatible con SDRA moderado.',
            confianza: 'ALTA',
          },
          {
            codigo: 'DEMO-006',
            etiqueta: 'Riesgo de lesión por presión',
            prioridad: 'INMEDIATA',
            factoresRiesgo: [
              'Inmovilidad',
              'Dispositivos médicos',
              'Nutrición comprometida',
              'Humedad',
            ],
            manifestacionesClave: [
              'Braden 11 — alto riesgo',
              'Encamado',
              'Múltiples dispositivos',
            ],
            justificacion:
              'Score de Braden 11 con presencia de múltiples factores de riesgo. Requiere medidas preventivas activas.',
            confianza: 'ALTA',
          },
          {
            codigo: 'DEMO-003',
            etiqueta: 'Riesgo de infección',
            prioridad: 'INMEDIATA',
            factoresRiesgo: [
              'CVC día 3',
              'TET día 2',
              'Ventilación mecánica',
              'Inmunosupresión relativa',
            ],
            manifestacionesClave: [
              'Leucocitos 14,800',
              'PCR 186',
              'PCT 2.8',
              'Múltiples dispositivos invasivos',
            ],
            justificacion:
              'Presencia de CVC, ventilación mecánica y proceso infeccioso activo. Riesgo elevado de NAVM y bacteriemia por catéter.',
            confianza: 'ALTA',
          },
        ],
        prioridadesInmediatas: [
          'Optimizar parámetros ventilatorios para ventilación protectora (VT 6 mL/kg peso ideal)',
          'Monitorización continua de SpO2, FR y sincronía con ventilador',
          'Vigilar presión plateau < 30 cmH2O',
          'Aplicar bundle completo de prevención NAVM',
        ],
        prioridadesIntermedias: [
          'Iniciar protocolo de insulina para control glucémico (meta 140-180 mg/dL en UCI)',
          'Implementar medidas de prevención de lesiones por presión',
          'Iniciar nutrición enteral según tolerancia',
          'Movilización precoz protocolizada',
        ],
        vigilanciaContinua: [
          'Diuresis horaria — meta ≥ 0.5 mL/kg/hr',
          'Función renal (creatinina)',
          'Tendencia de lactato',
          'Estado neurológico bajo sedación',
          'Control glucémico cada 2-4 horas',
        ],
      },
    },
  }).catch(() => {});

  console.log('✅ Datos semilla generados correctamente.');
  console.log('');
  console.log('👤 Usuarios de acceso:');
  console.log('   Admin:       admin@remeinia.org          / Admin2024!');
  console.log('   Enfermera:   enfermera.demo@remeinia.org / Enfermera2024!');
  console.log('   Supervisor:  supervisor.demo@remeinia.org / Supervisor2024!');
  console.log('   Revisor:     revisor@remeinia.org        / Revisor2024!');
  console.log('');
  console.log('🔔 AVISO: Los pacientes demo son COMPLETAMENTE FICTICIOS.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
