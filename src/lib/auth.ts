// ============================================================
// REMEINIA Care AI — Configuración de NextAuth (DEBUG MODE)
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
        console.log("========== 🔐 DEBUG LOGIN ==========");

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Credenciales vacías");
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;

        console.log("👉 Email recibido:", email);
        console.log("👉 Password length:", password.length);

        const usuario = await prisma.usuario.findFirst({
  where: {
    email: email,
  },
});

        console.log("👉 Usuario encontrado:", usuario);

        if (!usuario) {
          console.log("❌ Usuario NO existe");
          return null;
        }

        if (!usuario.activo) {
          console.log("❌ Usuario inactivo");
          return null;
        }

        const hash = usuario.passwordHash?.trim();

        console.log("👉 Hash en BD:", hash);
        console.log("👉 Hash length:", hash?.length);

        // Validación crítica de hash
        if (!hash || hash.length !== 60) {
          console.log("❌ Hash inválido (longitud incorrecta o vacío)");
          return null;
        }

        const passwordValida = await bcrypt.compare(password, hash);

        console.log("👉 Resultado bcrypt.compare:", passwordValida);

        if (!passwordValida) {
          console.log("❌ Password incorrecto");
          return null;
        }

        console.log("✅ PASSWORD CORRECTO");

        // Actualización de último acceso
        await prisma.usuario
          .update({
            where: { id: usuario.id },
            data: { ultimoAcceso: new Date() },
          })
          .catch((e) => console.log("⚠️ Error actualizando acceso:", e));

        // Bitácora
        await prisma.bitacoraAccion
          .create({
            data: {
              usuarioId: usuario.id,
              accion: 'login',
              detalles: { email: usuario.correoElectronico },
            },
          })
          .catch((e) => console.log("⚠️ Error en bitácora:", e));

        console.log("🎉 LOGIN EXITOSO");

        return {
          id: usuario.id,
          email: usuario.correoElectronico,
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