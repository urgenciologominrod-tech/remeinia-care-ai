// ============================================================
// REMEINIA Care AI — API: Crear valoración + ejecutar motor clínico
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ejecutarMotorClinico } from '@/lib/clinical-engine';
import type { ValoracionFormData } from '@/types/clinical';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();

  // Construir objeto de valoración para el motor clínico
  const datosClinicosMotor: ValoracionFormData = {
    inicialesPaciente: body.inicialesPaciente,
    edad: body.edad,
    sexo: body.sexo,
    servicio: body.servicio,
    cama: body.cama,
    diagnosticoMedico: body.diagnosticoMedico,
    comorbilidades: body.comorbilidades ?? [],
    motivoAtencion: body.motivoAtencion,
    signosVitales: {
      frecuenciaCardiaca: body.frecuenciaCardiaca,
      frecuenciaRespir: body.frecuenciaRespir,
      tensionArterialSis: body.tensionArterialSis,
      tensionArterialDias: body.tensionArterialDias,
      presionArterialMedia: body.presionArterialMedia,
      temperatura: body.temperatura,
      saturacionO2: body.saturacionO2,
      glucosaCapilar: body.glucosaCapilar,
      escalaDolor: body.escalaDolor,
      glasgow: body.glasgow,
      diuresisHora: body.diuresisHora,
    },
    gasometria: {
      pH: body.gaso_pH,
      PaCO2: body.gaso_PaCO2,
      PaO2: body.gaso_PaO2,
      HCO3: body.gaso_HCO3,
      SaO2: body.gaso_SaO2,
      Lactato: body.gaso_Lactato,
    },
    ventilacion: {
      activa: body.ventilacionMecanica ?? false,
      tipoO2: body.tipoO2,
      modoVentilatorio: body.modoVentilatorio,
      fio2: body.fio2,
      peep: body.peep,
      volumenTidal: body.volumenTidal,
      frProgramada: body.frProgramada,
      presionPico: body.presionPico,
      presionPlateau: body.presionPlateau,
      secreciones: body.secreciones,
      musculosAccesorios: body.musculosAccesorios,
      sincroniaVentilador: body.sincroniaVentilador,
    },
    laboratorios: body.laboratorios ?? {},
    valoracionSistemas: body.valoracionSistemas ?? {},
    dispositivos: body.dispositivos ?? {},
    observaciones: body.observaciones,
    prioridadesPercibidas: body.prioridadesPercibidas,
  };

  // Ejecutar motor clínico
  const resultado = ejecutarMotorClinico(datosClinicosMotor);

  // Calcular PaFiO2
  const paFiO2 = body.gaso_PaO2 && body.fio2
    ? Math.round(Number(body.gaso_PaO2) / Number(body.fio2))
    : undefined;

  // Guardar valoración en BD
  const valoracion = await prisma.valoracion.create({
    data: {
      inicialesPaciente: body.inicialesPaciente,
      edad: parseInt(body.edad),
      sexo: body.sexo,
      servicio: body.servicio,
      cama: body.cama,
      diagnosticoMedico: body.diagnosticoMedico,
      comorbilidades: body.comorbilidades ?? [],
      motivoAtencion: body.motivoAtencion,
      frecuenciaCardiaca: body.frecuenciaCardiaca ? parseFloat(body.frecuenciaCardiaca) : null,
      frecuenciaRespir: body.frecuenciaRespir ? parseFloat(body.frecuenciaRespir) : null,
      tensionArterialSis: body.tensionArterialSis ? parseFloat(body.tensionArterialSis) : null,
      tensionArterialDias: body.tensionArterialDias ? parseFloat(body.tensionArterialDias) : null,
      presionArterialMedia: body.presionArterialMedia ? parseFloat(body.presionArterialMedia) : null,
      temperatura: body.temperatura ? parseFloat(body.temperatura) : null,
      saturacionO2: body.saturacionO2 ? parseFloat(body.saturacionO2) : null,
      glucosaCapilar: body.glucosaCapilar ? parseFloat(body.glucosaCapilar) : null,
      escalaDolor: body.escalaDolor ? parseInt(body.escalaDolor) : null,
      glasgow: body.glasgow ? parseInt(body.glasgow) : null,
      diuresisHora: body.diuresisHora ? parseFloat(body.diuresisHora) : null,
      gaso_pH: body.gaso_pH ? parseFloat(body.gaso_pH) : null,
      gaso_PaCO2: body.gaso_PaCO2 ? parseFloat(body.gaso_PaCO2) : null,
      gaso_PaO2: body.gaso_PaO2 ? parseFloat(body.gaso_PaO2) : null,
      gaso_HCO3: body.gaso_HCO3 ? parseFloat(body.gaso_HCO3) : null,
      gaso_SaO2: body.gaso_SaO2 ? parseFloat(body.gaso_SaO2) : null,
      gaso_Lactato: body.gaso_Lactato ? parseFloat(body.gaso_Lactato) : null,
      gaso_PaFiO2: paFiO2 ?? null,
      ventilacionMecanica: body.ventilacionMecanica ?? false,
      tipoO2: body.tipoO2,
      modoVentilatorio: body.modoVentilatorio,
      fio2: body.fio2 ? parseFloat(body.fio2) : null,
      peep: body.peep ? parseFloat(body.peep) : null,
      volumenTidal: body.volumenTidal ? parseFloat(body.volumenTidal) : null,
      frProgramada: body.frProgramada ? parseFloat(body.frProgramada) : null,
      presionPico: body.presionPico ? parseFloat(body.presionPico) : null,
      presionPlateau: body.presionPlateau ? parseFloat(body.presionPlateau) : null,
      secreciones: body.secreciones,
      musculosAccesorios: body.musculosAccesorios ?? false,
      sincroniaVentilador: body.sincroniaVentilador ?? true,
      laboratorios: body.laboratorios ?? {},
      valoracionSistemas: body.valoracionSistemas ?? {},
      dispositivos: body.dispositivos ?? {},
      observaciones: body.observaciones,
      prioridadesPercibidas: body.prioridadesPercibidas,
      estadoPaciente: resultado.estadoPaciente,
      alertasActivas: JSON.parse(JSON.stringify(resultado.alertas)),
      creadoPor: userId,
    },
  });

  // Crear plan de cuidados vinculado
  const plan = await prisma.planCuidados.create({
    data: {
      valoracionId: valoracion.id,
      creadoPor: userId,
      contenido: resultado.plan,
    },
  });

  // Registrar en bitácora
  await prisma.bitacoraAccion.create({
    data: {
      usuarioId: userId,
      accion: 'crear_valoracion',
      recurso: valoracion.id,
      detalles: {
        folio: valoracion.folio,
        estadoPaciente: resultado.estadoPaciente,
        alertasCriticas: resultado.alertas.filter(a => a.tipo === 'critica').length,
      },
    },
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    valoracionId: valoracion.id,
    planId: plan.id,
    estadoPaciente: resultado.estadoPaciente,
    alertas: resultado.alertas,
    confianzaGlobal: resultado.confianzaGlobal,
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const userId = (session.user as any).id;
  const rol = (session.user as any).rol;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');

  const where = rol === 'ENFERMERO' ? { creadoPor: userId } : {};
  const [valoraciones, total] = await Promise.all([
    prisma.valoracion.findMany({
      where,
      orderBy: { fechaHora: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
      include: { usuario: { select: { nombre: true, apellidos: true } } },
    }),
    prisma.valoracion.count({ where }),
  ]);

  return NextResponse.json({ valoraciones, total, page, limit });
}
