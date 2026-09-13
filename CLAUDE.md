## What this project is

`expediente_hrl_front` is the React + TypeScript admin panel for `expediente_hrl_api`, the REST API that tracks research protocols for Hospital Regional de Loreto (HRL). It replaces the legacy `investigahrl` PHP frontend. Domain entities mirror the backend: Investigador (`Researcher`), Institución (`Institution`), Facultad (`Faculty`), Destino (`Destination`), Línea de Investigación (`ResearchLine`), Modalidad (`Modality`), Protocolo (`Protocol`).

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

Simple catalog entities (Researcher, Institution, Faculty, Destination, Modality) follow this exact template. `Protocol` is the one entity with real business rules and multi-step UI, so it additionally has `pages/protocols/steps/` (see below).

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
  ProtocolDetailPage.tsx     # read-only detail view
  protocol-error-messages.ts
  steps/
    ExpedienteStep.tsx       # expediente number, dates, título, esInstitucional switch, lugar de ejecución, destinos
    InstitucionStep.tsx      # institución, facultad (conditional), modalidad
    EquipoStep.tsx           # investigador principal, coinvestigadores, asesores, líneas de investigación
    HistoriaClinicaStep.tsx
    RevisionStep.tsx
    ResumenStep.tsx          # read-only summary of all steps, with a big "Editar" button per section
```

`ProtocolWizardPage` shares one `react-hook-form` instance (`FormProvider`) across all steps via `src/schemas/protocol.schema.ts`, so validation and values persist across step navigation. It tracks `maxStepReached` separately from the current step index so the `Stepper` (`components/ui/Stepper.tsx`) allows **free navigation to any previously-reached step**, not just backward — clicking a step calls `goToStep(index)`. `ResumenStep`'s "Editar" buttons call the same `goToStep`, they don't open a modal.

While a reached step is being revisited (`currentIndex < maxReachedIndex`), the `Stepper` shows that step's circle and its two adjacent connector lines in amber to signal "editing", while every other reached step stays green — this is a pure visual affordance (`isEditing` in `Stepper.tsx`), it has no effect on form state.

### Business rules implemented client-side (must match `protocolo.rules.ts` in the backend)

- **Institucional vs. externo** (`ExpedienteStep.tsx`): the `esInstitucional` switch controls `lugarEjecucion` and `destinoIds`. Institutional → `lugarEjecucion` is fixed to the Hospital Regional institution's name and destinos (memos) apply. Non-institutional → `lugarEjecucion` is free text, validated (`normalizeAlnum` in `protocol.schema.ts`) to reject any casing/spacing/hyphen variant of "Hospital Regional", and `destinoIds` is cleared and hidden entirely (not just disabled).
- **Facultad gated on `esUniversidad`** (`InstitucionStep.tsx`): the Facultad field only renders when the selected Institución has `esUniversidad: true` (see `Institution` in `types/entities.ts`); switching to a non-university institution clears `facultadId`.
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
