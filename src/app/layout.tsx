import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'REMEINIA Care AI | Apoyo Clínico para Enfermería',
  description: 'Plataforma inteligente de apoyo a la toma de decisiones clínicas para enfermería. Aval académico REMEINIA.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'REMEINIA Care' },
  keywords: ['enfermería', 'cuidados', 'clínica', 'REMEINIA', 'plan de cuidados', 'UCI', 'urgencias'],
  authors: [{ name: 'REMEINIA' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a6eeb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
