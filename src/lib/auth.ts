// ============================================================
// REMEINIA Care AI — Configuración de NextAuth
// ============================================================
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credenciales REMEINIA',
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;

        const usuario = await prisma.usuario.findFirst({
          where: { email },
        });

        if (!usuario) {
          return null;
        }

        if (!usuario.activo) {
          return null;
        }

        const hash = usuario.passwordHash?.trim();

        // Validación crítica de hash
        if (!hash || hash.length !== 60) {
          return null;
        }

        const passwordValida = await bcrypt.compare(password, hash);

        if (!passwordValida) {
          return null;
        }

        // Actualización de último acceso
        await prisma.usuario
          .update({
            where: { id: usuario.id },
            data: { ultimoAcceso: new Date() },
          })
          .catch(() => {});

        // Bitácora
        await prisma.bitacoraAccion
          .create({
            data: {
              usuarioId: usuario.id,
              accion: 'login',
              detalles: { email: usuario.email },
            },
          })
          .catch(() => {});

        return {
          id: usuario.id,
          email: usuario.email,
          name: `${usuario.nombre} ${usuario.apellidos}`,
          rol: usuario.rol,
          servicio: usuario.servicio,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol = (user as any).rol;
        token.servicio = (user as any).servicio;
        token.userId = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).rol = token.rol;
        (session.user as any).servicio = token.servicio;
        (session.user as any).id = token.userId;
      }
      return session;
    },
  },
};
