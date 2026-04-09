// ============================================================
// REMEINIA Care AI — Generador de PDF del plan de cuidados
// ============================================================
import type { PlanCuidadosCompleto } from '@/types/clinical';
import { COLORES_PRIORIDAD, LABELS_EVIDENCIA } from '@/types/clinical';
const textoSeguroPDF = (texto: string) => {
  return (texto || '')
    .normalize('NFKD')
    .replace(/₂/g, '2')
    .replace(/₀/g, '0')
    .replace(/₁/g, '1')
    .replace(/₃/g, '3')
    .replace(/₄/g, '4')
    .replace(/₅/g, '5')
    .replace(/₆/g, '6')
    .replace(/₇/g, '7')
    .replace(/₈/g, '8')
    .replace(/₉/g, '9')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/→/g, '->')
    .replace(/°/g, ' grados ')
    .replace(/⚠/g, 'ALERTA')
    .replace(/⚠️/g, 'ALERTA')
    .replace(/🔴/g, 'CRITICA')
    .replace(/🟡/g, 'PRECAUCION')
    .replace(/🔵/g, 'VIGILANCIA')
    .replace(/✓/g, 'OK')
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '');
};

const listaSeguraPDF = (items?: string[]) =>
  (items ?? []).map((x) => textoSeguroPDF(x)).join(', ') || '-';
// Importar jsPDF solo en cliente
export async function generarPDFPlan(
  plan: PlanCuidadosCompleto,
  paciente: {
    iniciales: string;
    edad: number;
    servicio: string;
    diagnosticoMedico: string;
    folio: string;
    enfermero: string;
    fecha: string;
  },
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const marginL = 15;
  const marginR = pageW - 15;
  let y = 15;

  const addPage = () => {
    doc.addPage();
    y = 20;
    drawHeader();
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > 275) addPage();
  };

  // ── Colores ──────────────────────────────────────────────
  const COLOR_AZUL: [number, number, number] = [10, 110, 235];
  const COLOR_GRIS: [number, number, number] = [100, 116, 139];
  const COLOR_ROJO: [number, number, number] = [248, 48, 48];
  const COLOR_NARANJA: [number, number, number] = [245, 159, 0];
  const COLOR_VERDE: [number, number, number] = [34, 197, 94];
  const COLOR_NEGRO: [number, number, number] = [30, 41, 59];

  // ── Encabezado ────────────────────────────────────────────
  const drawHeader = () => {
    doc.setFillColor(...COLOR_AZUL);
    doc.rect(0, 0, pageW, 12, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('REMEINIA Care AI', marginL, 8);
    doc.setFont('helvetica', 'normal');
    doc.text('Plataforma inteligente de apoyo clínico para enfermería', pageW / 2, 8, { align: 'center' });
    doc.text(`Folio: ${paciente.folio}`, marginR, 8, { align: 'right' });
  };

  drawHeader();
  y = 20;

  // ── Aviso legal ───────────────────────────────────────────
  doc.setFillColor(255, 251, 234);
  doc.setDrawColor(...COLOR_NARANJA);
  doc.roundedRect(marginL, y, marginR - marginL, 12, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_NEGRO);
  doc.setFont('helvetica', 'bold');
  doc.text('AVISO:', marginL + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  const avisoText = doc.splitTextToSize(
  textoSeguroPDF(
    'Este documento es generado por un sistema de apoyo a la toma de decisiones. NO sustituye el juicio clínico profesional. Todas las recomendaciones deben ser verificadas y validadas por el profesional de enfermería responsable.'
  ),
  marginR - marginL - 18,
);
  doc.text(avisoText, marginL + 18, y + 5);
  y += 17;

  // ── Título del documento ──────────────────────────────────
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_AZUL);
  doc.text('PLAN PERSONALIZADO DE CUIDADOS DE ENFERMERÍA', pageW / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_GRIS);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el ${new Date(plan.generadoEn).toLocaleString('es-MX')} | Elaboró: ${paciente.enfermero}`, pageW / 2, y, { align: 'center' });
  y += 6;

  if (plan.avalaRemeinia) {
    doc.setFillColor(240, 246, 255);
    doc.setDrawColor(...COLOR_AZUL);
    doc.roundedRect(pageW / 2 - 40, y, 80, 7, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_AZUL);
   doc.text('AVAL ACADEMICO REMEINIA', pageW / 2, y + 5, { align: 'center' });
    y += 11;
  }

  // ── Separador ────────────────────────────────────────────
  doc.setDrawColor(...COLOR_AZUL);
  doc.setLineWidth(0.5);
  doc.line(marginL, y, marginR, y);
  y += 6;

  // ── Sección 1: Datos del paciente ─────────────────────────
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_AZUL);
  doc.text('1. IDENTIFICACIÓN DEL PACIENTE', marginL, y);
  y += 6;

  (doc as any).autoTable({
    startY: y,
    head: [],
    body: [
      ['Iniciales:', paciente.iniciales, 'Edad:', `${paciente.edad} años`],
      ['Servicio:', paciente.servicio, 'Diagnóstico médico:', paciente.diagnosticoMedico],
      ['Folio:', paciente.folio, 'Fecha valoración:', paciente.fecha],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 }, 2: { fontStyle: 'bold', cellWidth: 35 } },
    margin: { left: marginL, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 5;

  // ── Sección 2: Resumen del paciente ───────────────────────
  checkPageBreak(25);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_AZUL);
  doc.text('2. RESUMEN CLÍNICO', marginL, y);
  y += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_NEGRO);
  const resumenLines = doc.splitTextToSize(textoSeguroPDF(plan.resumenPaciente), marginR - marginL);
  doc.text(resumenLines, marginL, y);
  y += resumenLines.length * 4.5 + 5;

  // ── Sección 3: Alertas clínicas ───────────────────────────
  if (plan.alertas.filter(a => a.tipo !== 'informativa').length > 0) {
    checkPageBreak(20);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_ROJO);
    doc.text('3. ALERTAS CLÍNICAS ACTIVAS', marginL, y);
    y += 5;

    const alertasData = plan.alertas
  .filter(a => a.tipo !== 'informativa')
  .map(a => [
    a.tipo === 'critica' ? 'CRITICA' : 'PRECAUCION',
    textoSeguroPDF(a.mensaje),
  ]);

    (doc as any).autoTable({
      startY: y,
      head: [['Tipo', 'Descripción']],
      body: alertasData,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: COLOR_ROJO, textColor: [255, 255, 255] },
      columnStyles: { 0: { cellWidth: 28, fontStyle: 'bold' } },
      margin: { left: marginL, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 5;
  }

  // ── Sección 4: Diagnósticos de enfermería ─────────────────
  checkPageBreak(20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_AZUL);
  doc.text('4. DIAGNÓSTICOS DE ENFERMERÍA SUGERIDOS', marginL, y);
  y += 3;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...COLOR_GRIS);
  doc.text(
  textoSeguroPDF('Los códigos y etiquetas son de uso demostrativo. Para uso clínico real, utilizar catalogos con licencia apropiada.'),
  marginL,
  y + 3
);
  y += 8;

  plan.diagnosticos.forEach((dx, i) => {
    checkPageBreak(30);
    const prioColor =
      dx.prioridad === 'INMEDIATA' ? COLOR_ROJO :
      dx.prioridad === 'INTERMEDIA' ? COLOR_NARANJA : COLOR_AZUL;

    doc.setFillColor(...prioColor);
    doc.roundedRect(marginL, y, marginR - marginL, 7, 1, 1, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(
  textoSeguroPDF(`${i + 1}. ${dx.etiqueta}  |  ${dx.prioridad}  |  Confianza: ${dx.confianza}`),
  marginL + 3,
  y + 5
);
    y += 9;

    (doc as any).autoTable({
      startY: y,
      head: [],
      body: [
  ['Factores relacionados / de riesgo:', listaSeguraPDF(dx.factoresRelacionados ?? dx.factoresRiesgo)],
  ['Manifestaciones clave encontradas:', listaSeguraPDF(dx.manifestacionesClave)],
  ['Justificacion clinica:', textoSeguroPDF(dx.justificacion)],
],
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 } },
      margin: { left: marginL + 3, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 4;
  });

  // ── Sección 5: Prioridades ────────────────────────────────
  checkPageBreak(35);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_AZUL);
  doc.text('5. PRIORIDADES DEL PLAN DE CUIDADOS', marginL, y);
  y += 5;

  const priData = [
  ...plan.prioridadesInmediatas.map(p => ['INMEDIATA', textoSeguroPDF(p)]),
  ...plan.prioridadesIntermedias.map(p => ['INTERMEDIA', textoSeguroPDF(p)]),
  ...plan.vigilanciaContinua.map(p => ['VIGILANCIA', textoSeguroPDF(p)]),
];
  (doc as any).autoTable({
    startY: y,
    head: [['Prioridad', 'Acción / Vigilancia']],
    body: priData,
    theme: 'striped',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: COLOR_AZUL, textColor: [255, 255, 255] },
    columnStyles: { 0: { cellWidth: 32, fontStyle: 'bold' } },
    margin: { left: marginL, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 5;

  // ── Sección 6: Recomendaciones por guías ──────────────────
  checkPageBreak(30);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_AZUL);
  doc.text('6. RECOMENDACIONES BASADAS EN EVIDENCIA', marginL, y);
  y += 3;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...COLOR_GRIS);
  doc.text(
  textoSeguroPDF('AVISO: Las referencias marcadas como [DATO DEMO] son ficticias y solo para demostracion del sistema.'),
  marginL,
  y + 3
);
  y += 8;

  plan.recomendacionesGuias.forEach((g, i) => {
    checkPageBreak(22);
    (doc as any).autoTable({
      startY: y,
      head: [[`Recomendación ${i + 1} | NE: ${LABELS_EVIDENCIA[g.nivelEvidencia]} | ${g.fuerzaRecomendacion ?? ''}`]],
     body: [
  [textoSeguroPDF(g.recomendacion)],
  [textoSeguroPDF(`Fuente: ${g.fuente}${g.anio ? ` (${g.anio})` : ''}${g.doi ? ` | DOI: ${g.doi}` : ''}`)],
], 
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [240, 246, 255], textColor: COLOR_AZUL, fontStyle: 'bold', fontSize: 8 },
      margin: { left: marginL, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 3;
  });

  // ── Firma y sello ─────────────────────────────────────────
  checkPageBreak(30);
  y += 5;
  doc.setDrawColor(...COLOR_GRIS);
  doc.setLineWidth(0.3);
  doc.line(marginL, y, marginL + 70, y);
  doc.text('Firma del profesional de enfermería', marginL, y + 4);
  doc.line(marginR - 70, y, marginR, y);
  doc.text('Sello institucional / Aval REMEINIA', marginR - 70, y + 4);

     // ── Pie de página ─────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_GRIS);
    doc.text(
      `REMEINIA Care AI - Documento confidencial, uso exclusivo del personal de salud autorizado - Pag. ${i}/${totalPages}`,
      pageW / 2,
      293,
      { align: 'center' },
    );
  }

  // Descargar
  doc.save(`REMEINIA-Plan-Cuidados-${paciente.folio}-${paciente.fecha.replace(/\//g, '-')}.pdf`);
}