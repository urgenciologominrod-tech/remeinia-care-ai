export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ejecutarMotorClinico } from '@/lib/clinical-engine';
import type { ValoracionFormData } from '@/types/clinical';

export async function POST(req: NextRequest) {
  const { authOptions } = await import('@/lib/auth');
  const { prisma } = await import('@/lib/prisma');

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();

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

  const resultado = ejecutarMotorClinico(datosClinicosMotor);

  const paFiO2 = body.gaso_PaO2 && body.fio2
    ? Math.round(Number(body.gaso_PaO2) / Number(body.fio2))
    : undefined;

  const valoracion = await prisma.valoracion.create({
    data: {
      ...body,
      edad: parseInt(body.edad),
      gaso_PaFiO2: paFiO2 ?? null,
      estadoPaciente: resultado.estadoPaciente,
      alertasActivas: JSON.parse(JSON.stringify(resultado.alertas)),
      creadoPor: userId,
    },
  });

  const plan = await prisma.planCuidados.create({
    data: {
      valoracionId: valoracion.id,
      creadoPor: userId,
      contenido: JSON.parse(JSON.stringify(resultado.plan)),
    },
  });

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
  const { authOptions } = await import('@/lib/auth');
  const { prisma } = await import('@/lib/prisma');

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

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