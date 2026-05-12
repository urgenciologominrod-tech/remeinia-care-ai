// ============================================================
// REMEINIA Care AI — Configuración de NextAuth
// ============================================================
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const DEMO_USERS = {
  'admin@remeinia.org': {
    password: 'Admin2024!',
    profile: {
      id: 'demo-admin',
      email: 'admin@remeinia.org',
      name: 'Administrador Académico',
      rol: 'ADMINISTRADOR',
      servicio: 'Académico',
      activo: true,
    },
  },
  'enfermera.demo@remeinia.org': {
    password: 'Enfermera2024!',
    profile: {
      id: 'demo-nurse',
      email: 'enfermera.demo@remeinia.org',
      name: 'Enfermera Académica',
      rol: 'ENFERMERO',
      servicio: 'Académico',
      activo: true,
    },
  },
} as const;

const PRESENTATION_DEMO_MODE = true; // Modo demo temporal para presentación académica. Desactivar después de la demo institucional.
const demoLoginEnabled = process.env.DEMO_LOGIN_ENABLED === "true" || PRESENTATION_DEMO_MODE;

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
          if (demoLoginEnabled) {
            const demoUser = DEMO_USERS[email as keyof typeof DEMO_USERS];

            if (demoUser && password === demoUser.password) {
              return demoUser.profile;
            }
          }

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
              detalles: { origen: 'auth-credentials' },
            },
          })
          .catch(() => {});

        return {
          id: usuario.id,
          email: usuario.email,
          name: `${usuario.nombre} ${usuario.apellidos}`,
          rol: usuario.rol,
          servicio: usuario.servicio,
          activo: usuario.activo,
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
