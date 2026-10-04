## What this project is

`expediente_hrl_front` is the React + TypeScript admin panel for `expediente_hrl_api`, the REST API that tracks research protocols for Hospital Regional de Loreto (HRL). It replaces the legacy `investigahrl` PHP frontend. Domain entities mirror the backend: Investigador (`Researcher`), Institución (`Institution`), Facultad (`Faculty`), Destino (`Destination`), Línea de Investigación (`ResearchLine`), Modalidad (`Modality`), Diseño de Estudio (`StudyDesign`), Protocolo (`Protocol`).

**This file documents the conventions actually implemented in `src/`.** If you're adding or changing a page/module, match what's already there. The sibling repo `expediente_hrl_api` (see its own `CLAUDE.md`) is the source of truth for entity shapes, validation rules, and `DomainErrorCode` values — this frontend must stay in sync with it, not diverge.

## Architecture: one folder per concern, one module per entity

There's no client-side state library beyond React Query — server state lives in `@tanstack/react-query`, form state in `react-hook-form`, and everything else is local component state. Structure:

```
src/
  api/            # one file per entity: thin wrappers around apiFetch, typed request/response
  hooks/          # one file per entity: React Query hooks (useXList, useX, useCreateX, useUpdateX, useDeleteX)
  schemas/        # one file per entity: zod schemas + inferred input types, shared by create/update forms
  types/          # entities.ts (domain types + Create/Update input types), common.ts (ApiError, Paginated), auth.ts
  pages/<entity>/ # <Entity>ListPage.tsx, <Entity>FormDialog.tsx, <entity>-search.ts, <entity>-error-messages.ts
  components/ui/  # generic, entity-agnostic building blocks (Dialog, Combobox, Table, Button, ...)
  components/layout/  # Sidebar, Topbar (app chrome)
  layouts/        # AuthLayout (public), AdminLayout (behind RequireAuth)
  app/            # providers.tsx (QueryClientProvider, AuthProvider), RequireAuth.tsx
```

Simple catalog entities (Researcher, Institution, Faculty, Destination, Modality, StudyDesign) follow this exact template. `Protocol` is the one entity with real business rules and multi-step UI, so it additionally has `pages/protocols/steps/` (see below) and its own `protocol-search.ts`/`protocol-error-messages.ts` at the top level of `pages/protocols/` rather than the per-entity subfolder pattern.

## Per-entity template (catalog entities)

For an entity like `institution`:

| File | Responsibility |
|---|---|
| `api/institutions.ts` | `listInstitutions`, `getInstitutionById`, `createInstitution`, `updateInstitution`, `deleteInstitution` — each a thin `apiFetch<T>(...)` call, no business logic |
| `hooks/useInstitutions.ts` | `useInstitutionsList(params)`, `useInstitution(id)` (queries) + `useCreateInstitution`, `useUpdateInstitution`, `useDeleteInstitution` (mutations). Mutations invalidate the `['institutions']` query key on success and show a `sonner` toast |
| `schemas/institution.schema.ts` | `zod` schema(s) for the form, plus the inferred TS input type used by `react-hook-form` |
| `pages/institutions/InstitutionsListPage.tsx` | Table + search + pagination + "new/edit" `FormDialog` trigger + delete `ConfirmDialog` |
| `pages/institutions/InstitutionFormDialog.tsx` | `Dialog` wrapping a `react-hook-form` form wired to the create/update mutation |
| `pages/institutions/institution-search.ts` | Client-side filter helper for the list page's search box |
| `pages/institutions/institution-error-messages.ts` | `getInstitutionErrorMessage(error)` — maps `ApiError.body.errorCode` (the backend's `DomainErrorCode`) to a Spanish, user-facing message; falls back to `error.message` or a generic connection-error string |

New failure codes added on the backend for an entity must get a matching `case` here — the switch is the single place a `DomainErrorCode` becomes user-facing text.

## The `Protocol` module (the one entity with real business rules)

`Protocol` doesn't fit the simple catalog template because the legacy form was one long page — it's rebuilt as a **guided multi-step wizard** instead:

```
pages/protocols/
  ProtocolsListPage.tsx      # list + search
  ProtocolWizardPage.tsx     # owns the FormProvider, step index, Stepper, and submit
  ProtocolDetailPage.tsx     # admin detail: pending-observation panel, review history, documents
  MyProtocolsPage.tsx / MyProtocolDetailPage.tsx   # researcher read-only list and thread
  ProtocolReviewDialog.tsx / ProtocolCorrectDialog.tsx   # dictamen (observations by type) / subsanar
  protocol-error-messages.ts
  steps/
    TipoRegistroStep.tsx     # Nuevo vs Enmienda (search a FINALIZED original, prefill the whole form)
    ExpedienteStep.tsx       # expediente number, dates, título, esInstitucional switch, lugar de ejecución, destinos
    EquipoStep.tsx           # investigador principal, coinvestigadores, asesores, líneas de investigación
    InstitucionPagoStep.tsx  # "Institución y pago": InstitucionStep (institución, facultad condicional, modalidad) + PagoStep
    PagoStep.tsx             # "¿Es convenio?": si sí se elige el convenio; si no, boleta/factura del pago con monto fijado por la modalidad (solo lectura)
    HistoriaClinicaStep.tsx
    DocumentacionEticaStep.tsx   # constancia ética, consentimiento, departamento, certificado (only with HC)
    ResumenStep.tsx          # read-only summary of all steps, with a big "Editar" button per section
```

`ProtocolWizardPage` shares one `react-hook-form` instance (`FormProvider`) across all steps via `src/schemas/protocol.schema.ts`, so validation and values persist across step navigation. It tracks `maxStepReached` separately from the current step index so the `Stepper` (`components/ui/Stepper.tsx`) allows **free navigation to any previously-reached step**, not just backward — clicking a step calls `goToStep(index)`. `ResumenStep`'s "Editar" buttons call the same `goToStep`, they don't open a modal.

While a reached step is being revisited (`currentIndex < maxReachedIndex`), the `Stepper` shows that step's circle and its two adjacent connector lines in amber to signal "editing", while every other reached step stays green — this is a pure visual affordance (`isEditing` in `Stepper.tsx`), it has no effect on form state.

### Business rules implemented client-side (must match `protocolo.rules.ts` in the backend)

- **Institucional vs. externo** (`ExpedienteStep.tsx`): the `esInstitucional` switch controls `lugarEjecucion` and `destinoIds`. Institutional → `lugarEjecucion` is fixed to the Hospital Regional institution's name and destinos (memos) apply. Non-institutional → `lugarEjecucion` is free text, validated (`normalizeAlnum` in `protocol.schema.ts`) to reject any casing/spacing/hyphen variant of "Hospital Regional", and `destinoIds` is cleared and hidden entirely (not just disabled).
- **Facultad gated on `esUniversidad`** (`InstitucionStep.tsx`): the Facultad field only renders when the selected Institución has `esUniversidad: true` (see `Institution` in `types/entities.ts`); switching to a non-university institution clears `facultadId`.
- **Pago exonerado** (`PagoStep.tsx`, sección del paso "Institución y pago"): the amount is read-only and is the fee of the chosen modality; the receipt (BOLETA `B###-n`, FACTURA `F###-n`, correlativo hasta 8 dígitos; `lib/comprobante.ts`, espejo de `comprobante.util.ts` del backend) is required when not exonerated. The N° de expediente follows `\d{1,4}/\d{1,6}`. The step asks first whether the protocol is a convenio (`esConvenio`, which makes `convenioId` required and hides the payment fields; turning it off clears `convenioId`). A protocol with a convenio or an enmienda pays 0 and carries no receipt; the amount is preloaded with the modality fee and comes back to it when the exoneration is lifted. The review purpose/date are no longer asked for at registration.
- **Documentación ética al registrar** (`DocumentacionEticaStep.tsx`): a constancia ética needs its N° and date; the certificado de buenas prácticas is only shown (and sent) when the protocol requires HC review. The CIEI only evaluates this documentation and sets the risk level.
- **No overlapping team roles** (`EquipoStep.tsx`): `investigadorPrincipalId` is excluded from the `teamOptions` passed to the coinvestigadores/asesores `MultiCombobox`, so the same researcher can't be picked twice.

If the backend adds or changes a rule in `protocolo.rules.ts`, mirror it here — check `expediente_hrl_api/CLAUDE.md`'s "Protocol" section and the corresponding `Protocolo*Exception` classes for the current source of truth, then add/update the matching `case` in `protocol-error-messages.ts` for any new `DomainErrorCode`.

## Shared `ui/` components

- **`Dialog.tsx`** — the base modal: a native `<dialog>` opened with `showModal()`, GSAP fade/scale-in on open, closes on backdrop click/`Escape`/`onCancel`. Fixed `max-w-md` by default; callers override via `className` (full replacement, not merged — see below). Every other modal (`Combobox`, `MultiCombobox`, all `*FormDialog`, `ConfirmDialog`) is built on top of it.
- **`Combobox.tsx`** (single-select) / **`MultiCombobox.tsx`** (multi-select) — **every** searchable list field in the app (any prop typed `ComboboxOption[]`) uses one of these two, never a raw `<select>` or an inline dropdown. Both open a `Dialog` with a search input; `MultiCombobox` additionally shows a removable "Seleccionados" section inside the modal and inline chips on the compact trigger field. Always pass `label` (e.g. `label="facultad"`) — it drives the modal title ("Seleccionar facultad" / "Agregar facultad").
- **`Stepper.tsx`** — used only by `ProtocolWizardPage`; see the `Protocol` section above for its `maxReachedIndex`/"editing" behavior.
- **`Switch.tsx`** — boolean toggles with a `label` + `description` (e.g. "Proyecto institucional", "Es universidad").
- **`ConfirmDialog.tsx`** — destructive-action confirmation (delete), thin wrapper over `Dialog`.

**Tailwind sizing gotcha**: when a component's className needs to change per caller (e.g. a wider modal), define it as a full-replacement default parameter — `className = 'max-w-md'` — and let the caller's value replace it entirely. Concatenating base + override with `cn()` puts both conflicting utility classes in the same `class` attribute, and Tailwind's generated CSS order (not HTML attribute order) decides which one wins, unpredictably.

**Native `<dialog>` gotchas**: a `<dialog>` shown via `showModal()` becomes the browser's containing block for `position: fixed` descendants (not the viewport) — this is why `Combobox`/`MultiCombobox` render their list as a nested `Dialog` instead of an absolutely/fixed-positioned dropdown portal. Also, never give a `<dialog>` element an unconditional `flex` (or similar `display`) class — author styles beat the UA stylesheet's `display: none` even while the dialog is closed; use the `open:` Tailwind variant if a dialog specifically needs a non-`block` internal layout.

## API layer

`src/api/client.ts` exports `apiFetch<T>(path, options)`: a single `fetch` wrapper that

- prefixes every call with `VITE_API_URL` (default `http://localhost:3000/api/v1`, must match the backend's `api/v1` global prefix),
- attaches `Authorization: Bearer <accessToken>` unless `options.auth === false`,
- on a `401`, transparently calls `POST /auth/refresh` once (de-duped via a module-level `refreshPromise` so concurrent 401s don't trigger parallel refreshes), retries the original request, and clears tokens (`token-storage.ts`) if the refresh itself fails,
- throws `ApiError(status, body)` (`src/types/common.ts`) for any non-2xx response, where `body.errorCode` is the backend's `DomainErrorCode` string.

Every `api/<entity>.ts` file only calls `apiFetch` — no `fetch` calls anywhere else in the codebase, and no business logic (retries, error mapping) beyond what `apiFetch` already centralizes.

## How to apply a change without breaking structure or conventions

1. **New field on an existing catalog entity** — update `types/entities.ts` (domain type + `Create`/`Update` input types), the `zod` schema in `schemas/<entity>.schema.ts`, the form fields in `<Entity>FormDialog.tsx`, and confirm `api/<entity>.ts` passes the field through unchanged (it should, since payloads are typed against the input types).
2. **New catalog entity** — copy the full per-entity template above (`api/`, `hooks/`, `schemas/`, `pages/<entity>/`) from `institution` (has the richest example: conditional field, switch, badge column). Add the route in `App.tsx` and a link in `components/layout/Sidebar.tsx`.
3. **New backend `DomainErrorCode` for an entity** — add the matching `case` in that entity's `*-error-messages.ts`. Never let a raw backend error code or `error.message` reach the UI unhandled for an expected failure mode.
4. **New searchable list field anywhere in the app** — use `Combobox` (single) or `MultiCombobox` (multi), never a native `<select>` or a bespoke dropdown. Pass a descriptive `label`.
5. **New step or field in the Protocolos wizard** — add it under `pages/protocols/steps/`, wire it into `ProtocolWizardPage`'s step list, and if it encodes a business rule, verify it against `protocolo.rules.ts` in `expediente_hrl_api` first — the two must never diverge silently (the backend is authoritative; the frontend check is a UX convenience, not a substitute for the backend's validation).
6. **Any new modal** — build it on `components/ui/Dialog.tsx` rather than a new `<dialog>`/portal from scratch, and follow the full-replacement `className` pattern if it needs non-default sizing.

## Related repos

- `expediente_hrl_api` (sibling directory) — the NestJS + Prisma backend this app consumes. Its `CLAUDE.md` documents the module template, `DomainErrorCode` enum, and per-entity business rules that this frontend must track.
- `investigahrl` (sibling directory) — the legacy PHP system being replaced. Useful as a reference for field names and historical business logic when a rule in the current backend is ambiguous, but never a source of conventions for new code.

## AI development pipeline

For a full requirement (not a one-line change or exploration), use the `dev-pipeline` skill (`.claude/skills/dev-pipeline/SKILL.md`): it runs researcher → planner → implementer → validation (`npm run lint && npm run build`) → reviewer → fixer, stopping to ask for a human decision on ambiguity, architecture changes, or after 2 failed review iterations. The five roles are defined in `.claude/agents/`.

If the work item lives in Taiga instead of being described inline, use the `taiga-pipeline` skill (`.claude/skills/taiga-pipeline/SKILL.md`) instead: it pulls the story/task/issue with the `taiga` subagent, gathers codebase context with `researcher`, persists both under `.claude/tasks/` (mirrored to Obsidian if configured), and then hands off to `dev-pipeline` from the planning step onward. Requires `USERNAME_TAIGA`/`PASSWORD_TAIGA`/`TAIGA_URL` in `.env`.

## Herramientas y compatibilidad de entornos (Claude Code vs. Antigravity)

Las directrices del proyecto permiten y promueven el uso de las **herramientas adaptadas de Antigravity, siempre y cuando se haga uso dentro del entorno de Antigravity**.

### Regla de uso de herramientas adaptadas
- **Dentro de Antigravity**: Se debe hacer uso de las herramientas nativas adaptadas de Antigravity (`view_file`, `replace_file_content`, `write_to_file`, `run_command`, `invoke_subagent`, `ask_question`, `read_url_content`, etc.). Queda estrictamente prohibido intentar invocar herramientas exclusivas de Claude Code (`EnterPlanMode`, `ExitPlanMode`, `AskUserQuestion`, o los nombres nativos `Read`/`Edit`/`Write`/`Bash`/`Agent`) que provoquen errores en la sesión.
- **Dentro de Claude Code**: Se utilizan las herramientas nativas del CLI de Claude Code (`Read`, `Edit`, `Write`, `Bash`, `Agent`, `EnterPlanMode`, `AskUserQuestion`).

### Evaluación contextual: según dónde se use la herramienta
Toda invocación de herramientas debe evaluarse conforme a tres ejes:

1. **Evaluación según el Entorno (Runtime Environment)**:
   - **Claude Code**: Invoca herramientas del protocolo de Claude.
   - **Antigravity**: Invoca herramientas del protocolo de Antigravity:
     - Lectura: `view_file` (en vez de `Read`/`cat`).
     - Edición: `replace_file_content` y `write_to_file` (en vez de `Edit`/`Write`).
     - Terminal: `run_command` (en vez de `Bash`).
     - Subagentes: `invoke_subagent` / `send_message` (en vez de `Agent`/`Task`).
     - Preguntas al usuario: `ask_question` (en vez de `AskUserQuestion`).
     - Planificación: Artefactos markdown en brain o comando `/plan` (en vez de `EnterPlanMode`/`ExitPlanMode`).
     - Navegación web / docs: `read_url_content` / `search_web` (en vez de `WebFetch`).

2. **Evaluación según el Rol / Fase del Pipeline (Scope & Permissions)**:
   - **Researcher**:
     - *Herramientas*: `view_file`, `run_command` (estrictamente de solo lectura: `git status`, `git diff`, `git log`, `graphify query`).
     - *Evaluación*: Prohibido editar archivos (`replace_file_content`, `write_to_file`) o correr comandos de build/test/migración.
   - **Planner**:
     - *Herramientas*: `view_file`, `ask_question` (para `OPEN QUESTIONS` con opciones interactivas para el usuario), artefactos markdown para el plan.
     - *Evaluación*: Prohibido escribir código en `src/`. No asumir decisiones arquitectónicas o de negocio no autorizadas sin consultar.
   - **Implementer**:
     - *Herramientas*: Si OpenCode/DeepSeek está instalado localmente, invocarlo con `run_command`. Si se ejecuta directamente en Antigravity (sin OpenCode o si este falla), evaluar el alcance y usar `replace_file_content` y `write_to_file` para ejecutar los `IMPLEMENTATION STEPS` del plan aprobado, respetando siempre `AFFECTED FILES` y las convenciones del proyecto. Finalizar obligatoriamente con la validación (`npm run lint && npm run build` vía `run_command`).
   - **Reviewer**:
     - *Herramientas*: `view_file`, `run_command` para inspeccionar `git diff`, `git status` y resultados de validaciones.
     - *Evaluación*: Estrictamente solo lectura. Jamás aplicar modificaciones de código.
   - **Fixer**:
     - *Herramientas*: `replace_file_content`, `write_to_file`, `run_command`.
     - *Evaluación*: Actuar exclusivamente sobre los puntos marcados en `REQUIRED_CHANGES`, seguido de la revalidación con `npm run lint && npm run build`.
   - **Taiga**:
     - *Herramientas*: `view_file` para `.env`, `read_url_content` o `run_command` (curl / pwsh) para interactuar con la API de Taiga.
     - *Evaluación*: Prohibición absoluta de operaciones destructivas (`DELETE`) sin confirmación explícita del usuario.

3. **Evaluación según Plataforma Host y Shell**:
   - **Windows (`pwsh` en Antigravity)**: Los comandos de `run_command` se ejecutan en PowerShell. Evaluar la sintaxis (evitar operadores unix no soportados, usar `$env:VAR` si se requieren variables, manejar rutas con comillas ante espacios).
   - **Linux/macOS (Bash en Claude Code o entornos Unix)**: Sintaxis estándar de Bash.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Instituciones y facultades

- Una institución tiene un tipo (`InstitutionType`: Hospital, Universidad, Otra; `pages/institutions/institution-types.ts`). Hospital y Otra solo llevan nombre y abreviatura. Una Universidad abre `UniversityFacultiesEditor` dentro de `InstitutionFormDialog`: al crearla, las facultades escritas son un borrador que se guarda (cada una como `POST /faculties`) tras crear la institución; al editarla, cada alta o baja se guarda al instante.
- Las facultades pertenecen a una universidad: `FacultyFormDialog` pide la universidad al crear (solo las de tipo Universidad) y no permite cambiarla al editar. `useFacultiesList` acepta `institutionId`; el paso "Institución y pago" del asistente solo carga las facultades de la universidad elegida y limpia la facultad al cambiar de institución.

## Flujo del investigador (rol `RESEARCHER`)

- `RequireAuth` acepta `roles`; un rol no permitido vuelve a su inicio (`lib/role-home.ts`: `ADMIN` → `/`, `RESEARCHER` → `/mis-protocolos`). Todo el panel administrativo va con `roles={['ADMIN']}`.
- `ResearcherLayout` (sin sidebar) + `MyProtocolsPage` consumen `GET /protocols/mine` (`useMyProtocolsList`, tipo `ProtocolSummary`): solo lectura, con estado y una línea de qué hacer según `ProtocolStatus`. El endpoint solo pagina, así que buscar/filtrar trae hasta 100 y filtra en cliente.
- `MyProtocolDetailPage` (`/mis-protocolos/:id`, `GET /protocols/mine/:id`, `useMyProtocol`): comité actual, enmienda, observación pendiente por tipo y el historial, todo de solo lectura y sin revisor ni montos. Un protocolo ajeno (404) y una cuenta sin vincular (403) se muestran como avisos.
- `RESEARCHER_ACCOUNT_NOT_LINKED` (403) se muestra como aviso, no como error.
- Los estados de protocolo viven en `pages/protocols/protocol-status.ts`; `ProtocolStatusBadge` solo renderiza.

## Formularios: piezas compartidas

- `FormField` vincula etiqueta, `hint` y error con el control (`aria-describedby`) vía contexto; los `Input`/`Textarea`/`Select`/`PasswordInput` lo leen solos. El error de servidor del formulario va en `FormAlert`, no con markup propio.
- Los controles usan `border-border-strong` (3:1 sobre blanco) y `placeholder:text-placeholder`; `border-border` queda para divisores. Estados válido/inválido son excluyentes (ver `Input.tsx`).

## Flujo de observaciones (detalle de protocolo)

- Un protocolo `*_OBSERVED` abre con `PendingObservationPanel`: observaciones agrupadas por tipo (`ObservationList`), comité, fecha, autor (solo en la vista admin) y el botón "Subsanar observación" (única entrada a la corrección). El historial (`ProtocolReviewTimeline`) va justo debajo y marca esa entrada como pendiente en vez de repetir el texto. Las observaciones de dictámenes antiguos (sin tipo) se muestran como "General".
- `ProtocolReviewDialog`: el resultado se elige con `RadioCardGroup` (cada opción explica su consecuencia; "Finalizar" aparece deshabilitado con su motivo cuando falta documentación ética registrada). Las observaciones son una lista repetible de tipo + texto (`useFieldArray`; OBSERVED exige al menos una completa, las filas vacías se descartan, una fila a medias marca error por campo con `setError`). El CIEI que finaliza solo establece el nivel de riesgo y ve en solo lectura la documentación registrada al crear. El pago ya no se verifica aquí. El error del servidor va en `FormAlert`.
- `ProtocolCorrectDialog` muestra las observaciones y habilita, además de título y lugar de ejecución, la sección de pago (si no está exonerado y hay observaciones ADMINISTRATIVE o sin tipo) y la de documentación ética (observaciones ETHICS_CONSTANCE, INFORMED_CONSENT o sin tipo); "Mostrar todos los campos corregibles" abre ambas. Un campo vacío de pago o departamento se envía como `null` para limpiarlo.
- Etiquetas de comité, resultado y tipo de observación: `pages/protocols/protocol-review-labels.ts`.
