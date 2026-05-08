# JobPilot — Plataforma de búsqueda de empleo tech con IA

> Agrega ofertas de Adzuna, Tecnoempleo y Jobatus en tiempo real, con filtrado avanzado, seguimiento de candidaturas y análisis de encaje por Inteligencia Artificial.

---

## ¿Qué es JobPilot?

JobPilot resuelve un problema real de los desarrolladores: consultar varios portales de empleo de forma manual, sin poder centralizar el seguimiento ni obtener retroalimentación objetiva sobre el propio perfil. La plataforma agrega, normaliza y deduplica ofertas de múltiples fuentes en una sola interfaz, y añade tres capacidades de IA para maximizar las posibilidades de éxito en cada candidatura.

---

## Funcionalidades

### Agregación multi-portal en tiempo real
El motor lanza en paralelo las consultas a la API de Adzuna y los scrapers de Tecnoempleo y Jobatus. Los resultados se normalizan a un esquema común (título, empresa, ubicación, salario, modalidad, descripción, portal de origen, fecha) y se deduplican automáticamente por clave `título + empresa` antes de llegar al cliente. Las peticiones se cachean en memoria 30 segundos por query.

### Filtrado avanzado
Búsqueda por texto con debounce de 500 ms. Filtros combinables: ubicación (10 ciudades + remoto), modalidad (remoto / híbrido / presencial), portal de origen, rango salarial y fecha de publicación.

### Paginación real
Usa el total real de Adzuna (más de 42.000 ofertas en España). El botón "Cargar más" acumula resultados sin reemplazar los anteriores.

### Autenticación segura con JWT + Refresh Tokens
- Access tokens JWT de 15 minutos
- Refresh tokens de 7 días en cookies `httpOnly` (nunca expuestos al JS del cliente)
- Rotación con `refreshTokenVersion` para invalidación masiva de sesiones
- El cliente Axios intercepta los 401 y reintenta tras renovar el token, con cola para evitar múltiples refreshes simultáneos

### Seguimiento de candidaturas
Registra cualquier oferta con 7 estados: `Aplicado → En proceso → 1ª entrevista → 2ª entrevista → Oferta → Rechazado → Descartado`. Calendario mensual interactivo con las aplicaciones de cada día y panel de estadísticas por estado.

### Inteligencia Artificial (GPT-4.1-mini)
Tres herramientas integradas en el detalle de cada oferta:

| Función | Qué hace |
|---|---|
| **Resumen de oferta** | Extrae los 5 puntos clave: responsabilidades, requisitos, tecnologías, tipo de empresa y atractivo |
| **Análisis de encaje** | Compara tu CV y skills con la oferta · devuelve % de encaje, fortalezas, gaps y recomendación final |
| **Mensaje para RRHH** | Genera un mensaje de contacto personalizado en español, adaptado a tu perfil y a la oferta |

El servicio incluye reintentos automáticos (hasta 3) con backoff exponencial y timeout de 30 s. Falla de forma elegante con 503 si no hay API key configurada.

### Autocompletado de perfil desde CV o portfolio
Pega el texto de tu CV o proporciona la URL de tu portfolio / LinkedIn / GitHub. La IA extrae skills, nombre, ubicación y resumen profesional y rellena los campos automáticamente. Las skills se fusionan con las ya existentes sin sobreescribir nada.

---

## Stack tecnológico

### Backend
| Tecnología | Uso |
|---|---|
| Node.js + Express 4 | Framework HTTP |
| TypeScript 5.5 | Tipado estricto |
| MongoDB Atlas + Mongoose | Base de datos cloud |
| Zod | Validación de schemas en runtime |
| jsonwebtoken + bcryptjs | Auth segura |
| Axios + Cheerio | Scraping de portales |
| OpenAI SDK | Integración con GPT |
| Helmet + cors + express-rate-limit | Seguridad HTTP |

### Frontend
| Tecnología | Uso |
|---|---|
| React 19 + Vite 6 | UI + build tool |
| TypeScript 5 | Tipado en componentes y stores |
| TailwindCSS v4 | Estilos utility-first |
| Zustand 5 + persist | Estado global ligero |
| React Router DOM 7 | Enrutado con rutas protegidas |
| Axios | Cliente HTTP con interceptores |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND  React + Vite · :5173                         │
│  Pages → Components → Stores (Zustand)                  │
│                  ↕ Axios proxy /api                     │
└─────────────────────────────────────────────────────────┘
                       ↕ HTTP / REST
┌─────────────────────────────────────────────────────────┐
│  BACKEND  Express · :5000                               │
│  Routes → Controllers → Services                        │
│                  ↓                                      │
│  Aggregator → Scrapers (Adzuna / Tecnoempleo / Jobatus) │
│  AI Service → OpenAI Client                             │
│  Models     → MongoDB Atlas                             │
└─────────────────────────────────────────────────────────┘
```

**Decisiones de diseño relevantes:**
- El frontend nunca habla directamente con las APIs externas. Todo pasa por el backend, donde se centralizan las API keys y los rate limits.
- `Promise.allSettled` en el aggregator: el fallo de un portal no interrumpe los resultados de los demás.
- Los scrapers incluyen User-Agent personalizado y timeouts explícitos.
- El normalizer de modalidad detecta patrones en español: "teletrabajo", "work from home", "modalidad híbrida", etc.

---

## Seguridad implementada

- **Helmet** configura 11 cabeceras HTTP (CSP, HSTS, X-Frame-Options…)
- **CORS** restringido al origen del frontend (no wildcard)
- Refresh tokens en cookies `httpOnly + sameSite: strict`
- Contraseñas con bcrypt salt 12, campo `select: false` en Mongoose
- Validación Zod en todas las rutas del backend
- Rate limiting global 100 req/15 min · IA 10 req/min
- `refreshTokenVersion` para invalidar todas las sesiones de un usuario

---

## API REST

### Autenticación — `/api/auth`
```
POST   /register            Registro
POST   /login               Login → access token + refresh cookie
POST   /refresh             Renovar access token
POST   /logout    [auth]    Cerrar sesión
GET    /me        [auth]    Obtener perfil
PUT    /me        [auth]    Actualizar perfil
```

### Ofertas — `/api/jobs`
```
GET    /search              Buscar ofertas (query, location, modalidad, portal, page…)
GET    /:id                 Detalle de oferta
GET    /portals             Portales soportados
```

### Candidaturas — `/api/applications` `[auth]`
```
GET    /                    Listar candidaturas
POST   /                    Registrar candidatura
PUT    /:id                 Actualizar estado / notas
DELETE /:id                 Eliminar
GET    /calendar            Candidaturas de un mes
```

### IA — `/api/ai` `[auth · 10 req/min]`
```
POST   /summarize-job       Resumen de oferta
POST   /match-profile       % de encaje perfil ↔ oferta
POST   /message-for-hr      Mensaje para RRHH
POST   /extract-profile     Extraer skills y datos desde CV o URL
```

---

## Desafíos técnicos resueltos

**1. Paginación de API externa con número en la URL**
La API de Adzuna requiere el número de página en el path (`/search/1`, `/search/2`…) y no como query param. Usarlo como `?page=N` devolvía siempre la página 1 silenciosamente.

**2. Scrapers resistentes a HTML cambiante**
Los selectores CSS se identificaron inspeccionando el HTML real servido, ya que difiere de lo documentado. `Promise.allSettled` garantiza que el fallo de un scraper no rompe los demás resultados.

**3. Refresh token sin race conditions**
Cuando múltiples peticiones fallan simultáneamente con 401, el interceptor de Axios encola las peticiones y solo hace una llamada a `/refresh`. Al renovar, reproduce todas las encoladas.

**4. Tipado estricto entre frontend y backend**
Los valores de runtime (labels, colores de estado) se exportan como valores, no solo como `type`, para que puedan usarse en el JSX sin errores de compilación.

**5. Autocompletado de perfil resiliente**
Si el scraping del portfolio falla (URL privada, timeout, bot-block), el sistema continúa con el texto del CV en lugar de lanzar un error. El parser de la respuesta JSON de la IA tiene su propio bloque de error para respuestas mal formadas.

---

## Arranque local

**Requisitos:** Node.js 20+, cuenta en MongoDB Atlas, claves de Adzuna y OpenAI.

```bash
# Backend
cd back
cp .env.example .env     # Rellenar: MONGO_URI, JWT_SECRET, ADZUNA_APP_ID,
                         #           ADZUNA_API_KEY, OPENAI_API_KEY
npm install
npm run dev              # → http://localhost:5000

# Frontend (nueva terminal)
cd front
npm install
npm run dev              # → http://localhost:5173
```

### Variables de entorno requeridas (`back/.env`)
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
REFRESH_TOKEN_SECRET=...
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
ADZUNA_APP_ID=...
ADZUNA_API_KEY=...
FRONTEND_URL=http://localhost:5173
```

---

## Estructura del proyecto

```
jobpilot/
├── back/
│   └── src/
│       ├── config/         Validación de env vars (Zod)
│       ├── controllers/    Capa HTTP
│       ├── middlewares/    Auth, validación, errores
│       ├── models/         Schemas Mongoose
│       ├── routes/         Endpoints REST
│       ├── services/       Lógica de negocio
│       ├── lib/
│       │   ├── aggregator.ts
│       │   ├── normalizer.ts
│       │   ├── token.ts
│       │   ├── ai/
│       │   └── scrapers/
│       └── server.ts
└── front/
    └── src/
        ├── components/     UI, Layout, Filters, Calendar, JobCard
        ├── hooks/
        ├── pages/
        ├── services/       Clientes de la API
        ├── store/          Estado global Zustand
        ├── types/
        └── utils/
```

---

## Mejoras futuras

- Integración con InfoJobs API oficial (OAuth2 ya contemplado en la config)
- Notificaciones por email al detectar ofertas que encajan con el perfil
- Caché distribuida con Redis para escalar horizontalmente
- Tests de integración con Supertest + componentes con Vitest / Testing Library
- Despliegue con Docker Compose para reproducibilidad total
- CI/CD con GitHub Actions: lint → test → build → deploy
- Exportación del historial de candidaturas a CSV / PDF

---

*Proyecto full-stack de nivel avanzado que cubre diseño de base de datos, API REST, integración de servicios externos, web scraping, autenticación segura y uso de LLMs como herramienta de valor añadido.*
