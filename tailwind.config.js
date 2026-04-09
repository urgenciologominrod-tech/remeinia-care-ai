/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta institucional REMEINIA
        clinical: {
          50:  '#f0f6ff',
          100: '#e0ecff',
          200: '#b8d4fe',
          300: '#7ab5fd',
          400: '#3590fa',
          500: '#0a6eeb',  // Azul clínico principal
          600: '#0054c4',
          700: '#0043a0',
          800: '#003a85',
          900: '#00256b',
          950: '#001540',
        },
        accent: {
          50:  '#f0fdf8',
          100: '#ccfbee',
          200: '#99f5de',
          300: '#5ee8c8',
          400: '#2dd4af',
          500: '#14b897',  // Verde teal acento
          600: '#0e9278',
          700: '#0e7561',
          800: '#0f5d4f',
          900: '#104d42',
        },
        danger: {
          50:  '#fff2f2',
          100: '#ffe1e1',
          200: '#ffc7c7',
          300: '#ff9a9a',
          400: '#ff5f5f',
          500: '#f83030',  // Rojo alerta
          600: '#e51111',
          700: '#c10b0b',
          800: '#a00d0d',
          900: '#841212',
        },
        warning: {
          50:  '#fffbea',
          100: '#fff3c4',
          200: '#ffe685',
          300: '#ffd246',
          400: '#ffbe1b',
          500: '#f59f00',  // Amarillo precaución
          600: '#d97707',
          700: '#b35309',
          800: '#91420d',
          900: '#773510',
        },
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Verde estable
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -2px rgba(0,0,0,.07)',
        clinical: '0 0 0 3px rgba(10,110,235,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
