# REMEINIA Care AI — Documentación Técnica Completa
> Plataforma inteligente de apoyo clínico para enfermería | Aval académico REMEINIA

---

## 1. RESUMEN EJECUTIVO DEL PROYECTO

REMEINIA Care AI es una Progressive Web App (PWA) de apoyo a la toma de decisiones clínicas para profesionales de enfermería, orientada a urgencias, UCI, terapia intensiva y hospitalización en México. La plataforma captura datos clínicos estructurados del paciente y genera un plan de cuidados personalizado con diagnósticos sugeridos, resultados esperados, intervenciones, priorización clínica y recomendaciones basadas en evidencia.

**El sistema NO es autónomo**: toda recomendación requiere validación del profesional de enfermería responsable.

---

## 2. ARQUITECTURA FUNCIONAL

```
┌────────────────────────────────────────────────────────┐
│                    CLIENTE (PWA)                        │
│  Next.js 14 + TypeScript + Tailwind CSS                │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────────┐    │
│  │  Login   │ │Dashboard │ │ Formulario 8 pasos  │    │
│  └──────────┘ └──────────┘ └─────────────────────┘    │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │  Plan de Cuidados    │  │   Admin Panel        │   │
│  └──────────────────────┘  └──────────────────────┘   │
└────────────────────────────┬───────────────────────────┘
                             │ HTTPS / API Routes
┌────────────────────────────▼───────────────────────────┐
│                    SERVIDOR (Next.js API)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Motor de Análisis Clínico              │  │
│  │   Evaluador de reglas → Diagnósticos → NOC/NIC  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────┐ ┌──────────────┐ ┌───────────────┐  │
│  │  Auth API    │ │  Valoraciones│ │  Admin API    │  │
│  │ (NextAuth)   │ │  API         │ │               │  │
│  └──────────────┘ └──────────────┘ └───────────────┘  │
└────────────────────────────┬───────────────────────────┘
                             │ Prisma ORM
┌────────────────────────────▼───────────────────────────┐
│                   PostgreSQL                            │
│  Usuarios | Valoraciones | Planes | Catálogos          │
│  Bitácora | Evidencia | Reglas | Configuración         │
└────────────────────────────────────────────────────────┘
```

---

## 3. MAPA DE MÓDULOS

| Módulo | Descripción | Roles |
|--------|-------------|-------|
| Autenticación | Login, sesión JWT, recuperación | Todos |
| Dashboard | Vista general + alertas activas | Todos |
| Valoración (8 pasos) | Captura clínica completa | Enfermero, Supervisor |
| Motor clínico | Análisis, reglas, sugerencias | Sistema (automático) |
| Plan de cuidados | Visualización + exportación PDF | Todos |
| Base de evidencia | Repositorio de guías y referencias | Todos |
| Panel administrativo | Usuarios, catálogos, reglas | Administrador |
| Módulo REMEINIA | Aval académico, modo docente | Revisor REMEINIA, Admin |
| Bitácora | Trazabilidad de acciones | Administrador |

---

## 4. MODELO DE DATOS (resumen)

```
Usuario ──────────────── Valoracion
   │                         │
   │                    PlanCuidados
   │                         │
   │                   EvolucionClinica
   │
   └──────────── BitacoraAccion

CatalogoDiagnostico   (NANDA-like, licenciado externamente)
CatalogoResultado     (NOC-like,   licenciado externamente)
CatalogoIntervencion  (NIC-like,   licenciado externamente)
EvidenciaClinica      (guías, meta-análisis, consensos)
ReglaClinica          (umbrales y lógica de alertas)
ConfiguracionSistema  (parámetros editables por admin)
```

---

## 5. INSTRUCCIONES PARA CORRER LOCALMENTE

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- npm o pnpm

### Pasos

```bash
# 1. Entrar al directorio
cd remeinia-care-ai

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL y NEXTAUTH_SECRET

# 4. Generar cliente Prisma
npm run db:generate

# 5. Crear la base de datos y las tablas
npm run db:push

# 6. Sembrar datos demo
npm run db:seed

# 7. Iniciar en desarrollo
npm run dev

# La app estará disponible en: http://localhost:3000
```

### Credenciales demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@remeinia.org | Admin2024! |
| Enfermera | enfermera.demo@remeinia.org | Enfermera2024! |
| Supervisor | supervisor.demo@remeinia.org | Supervisor2024! |
| Revisor REMEINIA | revisor@remeinia.org | Revisor2024! |

---

## 6. ESTRUCTURA DE CARPETAS

```
remeinia-care-ai/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   └── seed.ts                # Datos demo + configuración inicial
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # Íconos PWA (generar con herramienta)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── valoracion/nueva/page.tsx
│   │   │   ├── plan-cuidados/[id]/page.tsx
│   │   │   ├── admin/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── valoraciones/route.ts
│   │   │   ├── plan-cuidados/[id]/route.ts
│   │   │   └── admin/usuarios/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Redirect a login/dashboard
│   │   └── globals.css
│   ├── components/
│   │   ├── forms/              # Pasos del formulario clínico
│   │   ├── clinical/           # Visor del plan de cuidados
│   │   └── layout/             # Sidebar + TopBar
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── pdf-generator.ts
│   │   └── clinical-engine/
│   │       ├── index.ts        # Motor principal
│   │       └── rules.ts        # Evaluador de reglas
│   └── types/
│       └── clinical.ts         # Tipos TypeScript centrales
├── .env.example
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 7. REGLAS CLÍNICAS IMPLEMENTADAS

| Condición | Umbral | Tipo de alerta |
|-----------|--------|----------------|
| SpO₂ < 88% | Crítico | Hipoxemia grave |
| SpO₂ < 94% | Advertencia | Hipoxemia |
| PaFiO₂ < 100 | Crítico | SDRA grave |
| PaFiO₂ < 200 | Crítico | SDRA moderado |
| PaFiO₂ < 300 | Advertencia | SDRA leve |
| Lactato ≥ 4 mmol/L | Crítico | Hiperlactemia grave |
| Lactato ≥ 2 mmol/L | Advertencia | Hiperlactemia |
| PAM < 55 mmHg | Crítico | Hipotensión grave |
| PAM < 65 mmHg | Crítico | Hipoperfusión |
| pH < 7.20 | Crítico | Acidemia grave |
| pH < 7.35 | Advertencia | Acidemia |
| Glasgow ≤ 8 | Crítico | Deterioro grave de conciencia |
| Glucosa > 250 mg/dL | Crítico | Hiperglucemia grave |
| K⁺ ≥ 6.0 mEq/L | Crítico | Hiperpotasemia grave |
| K⁺ ≤ 2.5 mEq/L | Crítico | Hipopotasemia grave |
| Pplateau > 30 cmH₂O | Crítico | Barotrauma potencial |
| ≥ 3 criterios SIRS | Crítico | Alerta de sepsis |
| Diuresis < 0.3 mL/kg/hr | Crítico | Oliguria grave |
| CVC ≥ día 7 | Advertencia | Reevaluar necesidad |
| VM ≥ día 5 | Advertencia | Riesgo NAVM |

---

## 8. CONFIGURACIÓN PWA

La app es instalable como PWA en:
- Android: "Añadir a pantalla de inicio" desde Chrome
- iOS: "Añadir a pantalla de inicio" desde Safari
- Desktop: Icono de instalación en Chrome/Edge

Para los íconos PWA, generar con: https://www.pwabuilder.com/imageGenerator
Guardar en `public/icons/` con los tamaños especificados en `manifest.json`.

---

## 9. DESPLIEGUE EN PRODUCCIÓN

### Opción A: Vercel (recomendado)
```bash
npm install -g vercel
vercel --prod
# Configurar variables de entorno en dashboard de Vercel
# Usar PostgreSQL de Vercel, Supabase o Railway
```

### Opción B: VPS/Servidor propio
```bash
# Construir para producción
npm run build

# Iniciar servidor
npm start

# Usar pm2 para persistencia
npm install -g pm2
pm2 start npm --name "remeinia-care" -- start
pm2 save
pm2 startup

# Configurar nginx como proxy inverso
# SSL con Let's Encrypt (certbot)
```

### Variables de entorno requeridas en producción:
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://tudominio.com
NEXTAUTH_SECRET=clave-segura-generada-con-openssl
```

---

## 10. RECOMENDACIONES DE SEGURIDAD

1. **HTTPS obligatorio** — Never deploy sin SSL en producción
2. **Contraseñas seguras** — Mínimo 12 caracteres, rotación periódica
3. **Variables de entorno** — Nunca hardcodear secretos en el código
4. **Backups automáticos** — Configurar backups diarios de PostgreSQL
5. **Actualizaciones** — Mantener dependencias actualizadas (npm audit)
6. **Logs de auditoría** — Revisar BitacoraAccion periódicamente
7. **Privacidad del paciente** — Solo iniciales en valoraciones, no nombre completo
8. **Control de acceso por roles** — Verificar siempre el rol en cada API route
9. **Rate limiting** — Implementar límite de intentos de login (ver next-rate-limit)
10. **CSP headers** — Configurar Content Security Policy en next.config.js

---

## 11. RIESGOS ÉTICOS Y LEGALES

### A. Riesgos identificados

1. **Responsabilidad clínica**: Las sugerencias generadas podrían interpretarse como prescripciones. **Mitigación**: Avisos prominentes en toda la UI y documentos exportados.

2. **Derechos de autor de taxonomías**: NANDA-I, NOC y NIC son taxonomías registradas. **Mitigación**: La app usa catálogos demo marcados como ficticios. Para uso real, cargar taxonomías con licencia oficial de NANDA International / Mosby/Elsevier.

3. **Alucinaciones del motor clínico**: El motor basado en reglas puede generar sugerencias imprecisas con datos incompletos. **Mitigación**: Nivel de confianza visible, campo "datos insuficientes", nunca conclusiones absolutas.

4. **Privacidad del paciente** (LFPDPPP en México): No almacenar nombre completo, datos biométricos ni CURP. **Mitigación**: Solo iniciales/identificador en valoraciones.

5. **Regulación de software médico**: La NOM-024-SSA3-2012 regula los sistemas de información en salud. Para registro ante COFEPRIS como dispositivo médico de software (SaMD), se requiere evaluación regulatoria.

---

## 12. PARA LANZAMIENTO REAL — LO QUE SE NECESITA

### Técnico
- [ ] Registro de dominio institucional HTTPS
- [ ] Servidor/cloud con alta disponibilidad
- [ ] Backups automáticos y recuperación ante desastres
- [ ] Plan de monitoreo (Sentry, Datadog o similar)
- [ ] Pruebas de carga antes del lanzamiento
- [ ] Penetration testing por especialista en seguridad

### Clínico-académico
- [ ] Revisión y validación del motor clínico por comité experto REMEINIA
- [ ] Licenciamiento de catálogos NANDA-I, NOC y NIC de fuente oficial
- [ ] Curación del repositorio de evidencia con DOIs verificados
- [ ] Validación de las reglas clínicas con médicos intensivistas y enfermeros expertos
- [ ] Protocolo de gestión de errores clínicos/notificación de incidentes

### Legal/Regulatorio (México)
- [ ] Aviso de privacidad conforme a LFPDPPP
- [ ] Contrato de uso institucional
- [ ] Evaluación para registro COFEPRIS como SaMD (si aplica)
- [ ] Convenio con instituciones piloto
- [ ] Seguro de responsabilidad civil digital

---

## 13. INTEGRACIÓN FUTURA DE IA CLÍNICA

La app está preparada para integrar un LLM clínico revisado por humano:

```typescript
// Flujo propuesto — src/lib/ai-clinical/claude-integration.ts

// 1. El motor basado en reglas genera una evaluación base
const baseAnalysis = ejecutarMotorClinico(datos);

// 2. El LLM (con prompt clínico estructurado) enriquece las sugerencias
const prompt = buildClinicalPrompt(datos, baseAnalysis);
const aiSuggestions = await callAnthropicAPI(prompt); // claude-sonnet-4-6

// 3. Las sugerencias de IA van marcadas con confianza "REQUIERE_VALIDACION"
// y NO se muestran como definitivas

// 4. El profesional revisa, acepta, modifica o rechaza cada sugerencia
// Esto se registra en bitácora para retroalimentación del modelo
```

**Principios para la integración de IA:**
- Nivel de confianza siempre visible
- Trazabilidad de qué generó el sistema vs el profesional
- Human-in-the-loop obligatorio para decisiones críticas
- No almacenar datos sensibles del paciente en APIs externas de IA
- Usar modelos con capacidades de razonamiento clínico verificado

---

## 14. CONVERSIÓN A APP NATIVA (futuro)

Si se desea una app nativa (iOS/Android):

### Opción A: Capacitor.js (recomendada — reutiliza el código Next.js)
```bash
npm install @capacitor/core @capacitor/ios @capacitor/android
npx cap init
npx cap add ios
npx cap add android
npx cap sync
```

### Opción B: React Native con Expo
Requiere reescribir la UI en componentes React Native, manteniendo la lógica del motor clínico y las APIs.

### Opción C: Tauri (desktop nativo Windows/Mac/Linux)
Para uso en estaciones de trabajo hospitalarias.

---

## 15. ROADMAP DE ESCALAMIENTO

### v1.0 — MVP (actual)
- [x] Autenticación por roles
- [x] Formulario clínico 8 pasos
- [x] Motor de análisis por reglas
- [x] Plan de cuidados con prioridades
- [x] Exportación PDF
- [x] PWA instalable
- [x] Panel administrativo base
- [x] Datos demo ficticios marcados

### v1.5 — Estabilización clínica
- [ ] Carga de catálogos NANDA/NOC/NIC licenciados
- [ ] Módulo de evolución clínica (seguimiento turno a turno)
- [ ] Repositorio de evidencia curado por REMEINIA
- [ ] Modo docente con casos simulados
- [ ] Notificaciones push de alertas críticas

### v2.0 — Expansión institucional
- [ ] Multi-institución con aislamiento de datos
- [ ] Integración HL7 FHIR para interoperabilidad con expediente clínico
- [ ] API para conexión con monitores y equipos médicos
- [ ] Módulo de calidad: indicadores IAAS, estancia, complicaciones

### v3.0 — IA asistida
- [ ] Motor de IA clínica (LLM) con revisión humana obligatoria
- [ ] Aprendizaje federado sin compartir datos del paciente
- [ ] Predicción de deterioro clínico (early warning score)
- [ ] Soporte para múltiples idiomas (internacionalización)

---

## 16. CHECKLIST MVP

### Funcional
- [x] Login seguro con roles
- [x] Formulario de valoración completo (8 pasos)
- [x] Motor de reglas clínicas con alertas
- [x] Generación del plan de cuidados
- [x] Exportación a PDF
- [x] Dashboard con semaforización
- [x] Panel administrativo base
- [x] 3 pacientes demo ficticios
- [x] Bitácora de acciones
- [x] PWA instalable

### Seguridad
- [x] Autenticación JWT con expiración
- [x] Control de acceso por roles en APIs
- [x] Contraseñas hasheadas con bcrypt
- [x] Avisos de confidencialidad visibles
- [x] Sin datos biométricos del paciente
- [ ] Rate limiting en login (pendiente)
- [ ] CSP headers configurados (pendiente)
- [ ] Pruebas de penetración (pendiente producción)

### Clínico
- [x] Aviso "herramienta de apoyo" permanente
- [x] Nivel de confianza en cada sugerencia
- [x] Datos demo claramente marcados como ficticios
- [x] Catálogos preparados para carga externa licenciada
- [x] Referencias bibliográficas marcadas como demo/ficticias
- [ ] Validación por comité clínico REMEINIA (pendiente)
- [ ] Catálogos NANDA/NOC/NIC con licencia oficial (pendiente)

---

*REMEINIA Care AI v1.0 — Documento generado para uso interno del equipo de desarrollo y comité académico REMEINIA.*
