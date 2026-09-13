# expediente_hrl_front

Panel de administración para el seguimiento de protocolos de investigación del Hospital Regional de Loreto (HRL), construido con React + TypeScript + Vite. Consume la API REST de [`expediente_hrl_api`](../expediente_hrl_api) (NestJS + Prisma) — ver [CLAUDE.md](CLAUDE.md) para las convenciones de arquitectura seguidas en todo el código.

## Descripción

`expediente_hrl_front` es la interfaz web para el personal administrativo del HRL: permite gestionar los catálogos base (investigadores, instituciones, facultades, destinos, modalidades) y registrar/dar seguimiento a los protocolos de investigación, reemplazando el frontend PHP del sistema legado (`investigahrl`).

## Stack técnico

- **Framework:** React 19 + TypeScript, compilado con [Vite](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) (tokens de diseño en `src/index.css` vía `@theme`, sin `tailwind.config.js`)
- **Enrutamiento:** `react-router-dom` v7
- **Datos remotos:** `@tanstack/react-query` v5 sobre un cliente `fetch` propio (`src/api/client.ts`) con refresco automático de access token
- **Formularios:** `react-hook-form` + `zod` (vía `@hookform/resolvers`)
- **Animación:** [GSAP](https://gsap.com/) (`gsap`, `@gsap/react`) para transiciones de página, modales y pasos del wizard
- **Notificaciones:** `sonner` (toasts)
- **Iconos:** `@phosphor-icons/react`
- **Lint:** `oxlint`

## Estado actual del proyecto

### Módulos implementados

| Módulo | Ruta | Descripción |
|---|---|---|
| Autenticación | `/login` | Login contra `/auth/login`; sesión con access + refresh token (`src/api/token-storage.ts`) |
| Dashboard | `/` | Resumen general (`src/hooks/useDashboardStats.ts`, con datos mock en `src/mocks/dashboard.mock.ts` mientras el backend no expone un endpoint de estadísticas) |
| Investigadores | `/investigadores` | CRUD completo sobre `/researchers` |
| Instituciones | `/instituciones` | CRUD completo sobre `/institutions`, incluye el flag "Es universidad" que habilita/deshabilita selección de facultad |
| Facultades | `/facultades` | CRUD completo sobre `/faculties` |
| Destinos | `/destinos` | CRUD completo sobre `/destinations` |
| Modalidades | `/modalidades` | CRUD completo sobre `/modalities` |
| Protocolos | `/protocolos`, `/protocolos/nuevo`, `/protocolos/:id` | Listado, wizard de creación multi-paso y detalle, sobre `/protocols` |

Todas las rutas salvo `/login` están protegidas por `RequireAuth` (`src/app/RequireAuth.tsx`), que exige un access token válido.

### Pendiente

- Endpoint real de estadísticas del dashboard (hoy usa datos mock)
- Edición y revisión de protocolos existentes (`ProtocolDetailPage` es de solo lectura)
- Gestión de usuarios (el backend aún no expone CRUD de `User`)

## Reglas de negocio del módulo de Protocolos

El wizard de creación (`src/pages/protocols/ProtocolWizardPage.tsx` + `src/pages/protocols/steps/`) refleja las reglas de dominio definidas en el backend (`protocolo.rules.ts`):

- **Proyecto institucional vs. externo**: si el protocolo es institucional, se ejecuta en el Hospital Regional de Loreto y los memos (destinos) aplican; si no, el lugar de ejecución es un campo de texto libre (validado para que no pueda contener ninguna variante de "Hospital Regional") y los destinos no aplican.
- **Facultad condicionada a "Es universidad"**: la facultad solo se muestra/permite seleccionar si la institución elegida tiene el flag `esUniversidad` activo.
- **Roles del equipo sin solapamiento**: un mismo investigador no puede ser a la vez investigador principal y coinvestigador/asesor del mismo protocolo.

Los mensajes de error de dominio que devuelve la API se traducen a español en `src/pages/protocols/protocol-error-messages.ts` (mismo patrón que `*-error-messages.ts` en cada módulo de catálogo).

## Componentes de selección (Combobox / MultiCombobox)

Todos los campos de selección desde una lista (investigador principal, institución, facultad, modalidad, líneas de investigación, coinvestigadores, asesores, destinos) usan `src/components/ui/Combobox.tsx` (selección única) o `src/components/ui/MultiCombobox.tsx` (selección múltiple). Ambos abren un modal (`Dialog`) con buscador, lista de elementos disponibles y — en el caso múltiple — una sección de "Seleccionados" removible tanto desde el modal como desde el campo compacto.

## Configuración del entorno

```bash
cp .env.example .env
```

| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_URL` | URL base de la API (incluye el prefijo `/api/v1`) | `http://localhost:3000/api/v1` |

No existe validación de entorno en build time: si `VITE_API_URL` no está definida, se usa el default apuntando al backend en local.

## Instalación

```bash
npm install
```

## Ejecutar el proyecto en desarrollo

```bash
npm run dev
```

Requiere que `expediente_hrl_api` esté corriendo (por defecto en `http://localhost:3000`) con `CORS_ORIGIN` incluyendo el origen de este dev server (por defecto `http://localhost:5173`).

## Build de producción

```bash
npm run build   # tsc -b && vite build
npm run preview # sirve el build de dist/ localmente
```

El build es estático (`dist/`); se despliega en cualquier hosting de archivos estáticos (Vercel, Netlify, Nginx, etc.) configurando `VITE_API_URL` en tiempo de build hacia la URL pública de la API.

## Lint

```bash
npm run lint
```

## Licencia

Proyecto privado, sin licencia pública.
