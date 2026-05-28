# Digital Bullet Journal

> Aplicación web con IA para el seguimiento del bienestar mental: registra tu estado de ánimo, hábitos y diario personal, y obtén análisis de tus patrones emocionales con Inteligencia Artificial.

---

## Descripción general

Digital Bullet Journal es una aplicación web full-stack que combina las técnicas del bullet journaling analógico con el poder de la Inteligencia Artificial. Permite a los usuarios llevar un registro diario de su estado de ánimo, construir hábitos de forma constante, escribir entradas de diario con formato enriquecido y recibir un análisis psicológico de sus patrones emocionales a lo largo del tiempo.

---

## Problema o necesidad que resuelve

El bienestar emocional y mental es difícil de seguir de forma consistente. Las personas que desean entender sus estados de ánimo, construir hábitos positivos y reflexionar a través de la escritura normalmente usan herramientas separadas y desconectadas. Digital Bullet Journal centraliza el registro de hábitos, el seguimiento del estado de ánimo y el diario personal en una sola aplicación, y agrega una capa de análisis con IA que identifica patrones emocionales que el usuario por sí solo difícilmente notaría.

---

## Integrantes del equipo

| Integrante | Rol | Responsabilidades |
|---|---|---|
| Laura | Líder técnica / Desarrollo completo | Arquitectura del proyecto, base de datos, autenticación, todos los módulos, documentación y despliegue |

---

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI Library | React 19 |
| Lenguaje | TypeScript (strict mode) |
| Estilos | Tailwind CSS |
| Editor de texto | Tiptap (rich text editor) |
| Base de datos | Oracle Database 23ai (Autonomous Database) |
| Driver DB | oracledb (Node.js) |
| Autenticación | bcryptjs + JWT (jose) · cookies httpOnly |
| Gestión de secretos | OCI Vault |
| IA | Claude API — modelo `claude-sonnet-4-20250514` |
| Testing | Jest + React Testing Library |

---

## Herramienta de IA utilizada

**Claude Code (Anthropic)** fue la herramienta principal de IA durante todo el desarrollo. Se utilizó de forma iterativa en cada fase del proyecto para diseñar, implementar, corregir y documentar la aplicación.

Dentro de la aplicación, el módulo **Analizador de Emociones** consumirá directamente la **Claude API** (`claude-sonnet-4-20250514`) para generar análisis psicológicos de las entradas del usuario.

---

## Cómo se usó la IA — Prompts principales

La IA fue utilizada como asistente de desarrollo activo, no como generador de código ciego. A continuación se describen los usos principales y ejemplos de los prompts que guiaron el desarrollo:

### Diseño de arquitectura y base de datos
> *"Estoy construyendo una aplicación Next.js con App Router y Oracle 23ai. Diseña el esquema completo de tablas para un sistema con autenticación, mood tracker, habit tracker y journal entries. Usa UUIDs como PKs, columnas created_at/updated_at en todas las tablas y FK a la tabla de usuarios."*

### Implementación del sistema de autenticación
> *"Implementa autenticación email/password con bcrypt para hashing y JWT almacenado en cookies httpOnly. Incluye middleware de protección de rutas en Next.js App Router que redirija a /login si no hay sesión válida."*

### Construcción del connection pool con OracleDB
> *"Configura un connection pool con oracledb para Next.js que funcione correctamente en desarrollo con hot-reload. El pool debe inicializarse una sola vez usando un patrón singleton."*

### Módulos de CRUD (Mood, Habits, Journal)
> *"Implementa el API route /api/mood con GET y POST. El GET devuelve el historial del usuario autenticado ordenado por fecha. El POST valida el estado de ánimo contra una lista fija de valores permitidos y persiste en Oracle usando el pool de conexiones."*

### Analizador de emociones con Claude API
> *"Construye el módulo de análisis de emociones que consulta la Claude API con las entradas de mood y journal del usuario para un rango de tiempo seleccionado. El prompt debe pedir un análisis desde perspectiva psicológica de patrones y tendencias emocionales. Aplica límites de tokens según el rango: día=1000, semana=2000, mes=4000, año=6000."*

### Corrección y refinamiento iterativo
A lo largo del desarrollo, la IA fue consultada para resolver problemas específicos: errores de tipado TypeScript, compatibilidad de Oracle con tipos de datos, manejo de CLOB para el editor de texto, y ajustes de comportamiento en componentes de React con `"use client"`.

---

## Funcionalidades principales

### Dashboard principal
Vista centralizada con acceso rápido a todos los módulos. Muestra widgets de estado de ánimo, hábitos activos y acceso al diario. El widget del analizador de emociones está visible como placeholder hasta la siguiente versión.

### Rastreador de Estado de Ánimo (Mood Tracker)
- Registro de estado de ánimo con 8 opciones: Happy, Sad, Anxious, Calm, Angry, Excited, Tired, Neutral.
- Múltiples entradas por día con fecha personalizable.
- Historial visual de entradas.

### Rastreador de Hábitos (Habit Tracker)
- Creación de hábitos con nombre y duración objetivo (mínimo 22 días).
- Check-in diario: marcar el hábito como completado o no.
- Cálculo automático de racha (streak) y porcentaje de cumplimiento.
- Visualización de la cuadrícula de check-ins del mes.

### Diario Personal (Journal)
- Editor de texto enriquecido (Tiptap) con formato: negritas, cursivas, listas, encabezados.
- Entradas con fecha personalizable.
- Historial de entradas anteriores.

### Analizador de Emociones (Emotions Analyzer) — Próximamente
> Este módulo estará disponible en la siguiente versión de la aplicación.

El Analizador de Emociones consumirá la Claude API (`claude-sonnet-4-20250514`) para generar análisis psicológicos basados en las entradas de diario y estado de ánimo del usuario. Las funcionalidades planeadas incluyen:
- Selección de rango temporal: día, semana, mes o año.
- Límites de tokens ajustados por rango (día=1000, semana=2000, mes=4000, año=6000).
- Resultado presentado como resumen de patrones y tendencias desde una perspectiva psicológica.

### Autenticación
- Registro e inicio de sesión con email y contraseña.
- Contraseñas almacenadas con bcrypt.
- Sesiones con JWT en cookies httpOnly.
- Rutas protegidas con middleware de Next.js.

### Integración con Oracle Database 23ai
- Todos los datos del usuario (estado de ánimo, hábitos, check-ins, entradas de diario) se almacenan en Oracle Database 23ai (Autonomous Database).
- La conexión se gestiona mediante un pool de conexiones con `oracledb`, inicializado como singleton para reutilizarse entre peticiones.
- El texto enriquecido del diario se almacena en columnas `CLOB`.
- Todas las tablas usan UUIDs como llaves primarias y registran `created_at` / `updated_at` automáticamente mediante triggers.

### Gestión de secretos con OCI Vault
- Las credenciales sensibles (usuario y contraseña de base de datos, JWT secret, API key de Claude) se almacenan en OCI Vault.
- En producción, la aplicación recupera los secretos directamente desde Vault en tiempo de ejecución, sin exponerlos en el código ni en archivos de configuración.
- En desarrollo local se usan variables de entorno en `.env.local` como alternativa.

---

## Estructura del proyecto

```
digital-bullet-journal/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/          # Página de login
│   │   │   └── signup/         # Página de registro
│   │   ├── (protected)/
│   │   │   ├── dashboard/      # Dashboard principal
│   │   │   ├── mood/           # Mood Tracker + historial
│   │   │   ├── habits/         # Habit Tracker + nuevo hábito
│   │   │   ├── journal/        # Diario + historial
│   │   │   └── analyzer/       # Analizador de emociones
│   │   └── api/
│   │       ├── auth/           # Login, logout, signup
│   │       ├── mood/           # CRUD entradas de ánimo
│   │       ├── habits/         # CRUD hábitos y check-ins
│   │       └── journal/        # CRUD entradas de diario
│   ├── components/
│   │   ├── dashboard/          # Widgets del dashboard (Mood, Habits, Journal, Emotions)
│   │   └── habits/             # Componentes del habit tracker
│   ├── lib/
│   │   ├── auth/               # JWT, bcrypt, sesión, validación
│   │   ├── db/                 # Pool de conexiones Oracle, OCI Vault
│   │   ├── mood/               # Lógica de negocio del mood tracker
│   │   ├── habits/             # Lógica de negocio del habit tracker
│   │   ├── journal/            # Lógica de negocio del diario
│   │   └── ui/                 # Componentes de UI reutilizables
│   ├── database_scripts/       # Scripts SQL de creación y migración de tablas
│   └── types/                  # Tipos TypeScript globales
├── CLAUDE.md                   # Especificación arquitectónica del proyecto
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## Instrucciones para instalar y ejecutar

### Requisitos previos
- Node.js 20 o superior
- Acceso a Oracle Database 23ai (Autonomous Database) o instancia local
- Oracle Instant Client instalado y configurado en el sistema
- Cuenta en Anthropic con API key (para el módulo de análisis de emociones)
- (Opcional) OCI Vault configurado para gestión de secretos

### 1. Clonar el repositorio

```bash
git clone https://github.com/laurabps/digital-bullet-journal.git
cd digital-bullet-journal
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Base de datos Oracle
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_CONNECTION_STRING=your_oracle_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars

# Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# OCI Vault (opcional — solo si usas OCI Vault en lugar de env vars directas)
OCI_VAULT_SECRET_ID=your_secret_ocid
```

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### 5. Ejecutar pruebas

```bash
npm test
```

---

## Capturas de pantalla

> Las capturas de pantalla se encuentran en [esta](https://drive.google.com/drive/folders/1dCkLI_3sQnDzXTX4Vh50cq9YaFyqZeZd?usp=sharing) carpeta de drive y en el documento PDF de entrega del proyecto.

---

## Futuras funcionalidades

### Analizador de Emociones
Integración con la Claude API para analizar patrones emocionales a partir de las entradas de diario y estado de ánimo. El usuario podrá seleccionar un rango de tiempo (día, semana, mes o año) y recibir un resumen desde una perspectiva psicológica de sus tendencias emocionales.

### Personalización visual
Configuración de tema por usuario: selección de paleta de colores y tipo de fuente dentro de la aplicación, para que cada persona pueda adaptar la interfaz a su estilo personal.

### Migración a servidor en la nube
Despliegue de la aplicación en infraestructura cloud (Vercel para el frontend y Oracle Cloud para la base de datos) para mejorar los tiempos de respuesta y disponibilidad, eliminando la dependencia del servidor local de desarrollo.

---

## Conclusión

Digital Bullet Journal nació de la necesidad de tener una herramienta de introspección personal que fuera más que un simple diario: un sistema que ayude a ver patrones en el estado de ánimo, a construir hábitos de manera sostenida y a reflexionar de forma estructurada sobre el bienestar mental.

El uso de la Inteligencia Artificial durante el desarrollo permitió acelerar significativamente la implementación de una arquitectura compleja que combina Next.js App Router, Oracle Database 23ai y autenticación personalizada. Sin embargo, el valor real del proyecto está en la comprensión profunda de cada decisión técnica: desde la configuración del connection pool de Oracle hasta la integración de la Claude API para análisis de emociones.

El módulo de Analizador de Emociones, planificado para la siguiente versión, representará la intersección más interesante del proyecto: tomará datos personales del usuario (entradas de diario y estados de ánimo) y los transformará en observaciones psicológicas accionables gracias a la Claude API. Esta funcionalidad demostrará cómo la IA puede agregar valor real en aplicaciones de bienestar sin reemplazar la reflexión personal, sino complementándola.

---

## Información académica

| Campo | Detalle |
|---|---|
| Materia | Desarrollo de Aplicaciones Web en la Nube y Móviles |
| Profesor | ZEUS EMANUEL GUTIERREZ COBIAN |
| Integrante | Laura |
| Ciclo escolar | 2026 |
