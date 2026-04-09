export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const crearUsuarioSchema = z.object({
  email: z.string().email(),
  nombre: z.string().min(2),
  apellidos: z.string().min(2),
  password: z.string().min(8),
  rol: z.enum(['ENFERMERO', 'SUPERVISOR', 'ADMINISTRADOR', 'REVISOR_REMEINIA']),
  servicio: z.string().optional(),
  cedula: z.string().optional(),
  institucion: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { authOptions } = await import('@/lib/auth');
  const { prisma } = await import('@/lib/prisma');

  const session = await getServerSession(authOptions);
  const rol = (session?.user as any)?.rol;
  if (rol !== 'ADMINISTRADOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      email: true,
      nombre: true,
      apellidos: true,
      rol: true,
      servicio: true,
      activo: true,
      ultimoAcceso: true,
      cedula: true,
      institucion: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ usuarios });
}

export async function POST(req: NextRequest) {
  const { authOptions } = await import('@/lib/auth');
  const { prisma } = await import('@/lib/prisma');

  const session = await getServerSession(authOptions);
  const rol = (session?.user as any)?.rol;
  if (rol !== 'ADMINISTRADOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await req.json();
  const data = crearUsuarioSchema.parse(body);

  const existe = await prisma.usuario.findUnique({
    where: { email: data.email },
  });

  if (existe) {
    return NextResponse.json(
      { error: 'El correo ya está registrado' },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const usuario = await prisma.usuario.create({
    data: {
      email: data.email,
      nombre: data.nombre,
      apellidos: data.apellidos,
      rol: data.rol,
      servicio: data.servicio,
      cedula: data.cedula,
      institucion: data.institucion,
      passwordHash,
    } as any,
  });

  await prisma.bitacoraAccion.create({
    data: {
      usuarioId: (session?.user as any).id,
      accion: 'crear_usuario',
      recurso: usuario.id,
      detalles: {
        email: usuario.email,
        rol: usuario.rol,
      },
    },
  });

  return NextResponse.json(
    { success: true, usuarioId: usuario.id },
    { status: 201 }
  );
}

export async function PATCH(req: NextRequest) {
  const { authOptions } = await import('@/lib/auth');
  const { prisma } = await import('@/lib/prisma');

  const session = await getServerSession(authOptions);
  const rol = (session?.user as any)?.rol;
  if (rol !== 'ADMINISTRADOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await req.json();
  const { id, activo } = body;

  await prisma.usuario.update({
    where: { id },
    data: { activo },
  });

  return NextResponse.json({ success: true });
}
