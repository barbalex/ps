# CLAUDE.md

This file provides guidance to AI coding agents (Claude Code and others, via AGENTS.md) when working with code in this repository.

## Project Overview

**arten-fördern.app** — A collaborative platform for nature conservation experts to manage rare/endangered species and habitats. Inspired by apflora.ch.

**Tech Stack:** TypeScript, React 19, TanStack Router/Query, PostgreSQL, ElectricSQL, PGlite (in-browser), Fluent UI

---

## Common Commands

### Development

```bash
npm run dev           # Start Vite dev server + Caddy proxy (localhost:5176)
npm run dev-host      # Expose dev server to network
npm run build         # Production build → frontend/dist
npm run preview       # Preview production build
npm run deploy        # Deploy: bump patch version + date, push main, update production branch (Netlify deploys production)
npm run deploy minor  # Same with a minor bump (or: major)
```

### Code Quality

```bash
npm run lint          # ESLint (max 0 warnings allowed)
npm run format        # Prettier formatting
```

### Testing

```bash
npm run verify       # lint + unit tests + sync-sql + i18n checks — run before claiming any task done
npm test             # Unit tests only (vitest) — no backend needed: loads the real SQL schema into in-memory PGlite
npm run test:e2e     # Playwright e2e — requires the dev stack running and Caddy installed; starts `npm run dev` itself if missing
```

- Unit tests (`tests/`) never touch Docker — `tests/helpers/createTestDb.ts` boots PGlite with the real schema and provides reader/writer/designer/outsider fixtures
- E2e specs (`e2e/`) provision their own users and roles against the dev stack via `e2e/helpers.ts` (`ensureUser`, `grantRoles`, `ensureProjectFixture`, `login`)
- `E2E_EMAIL` / `E2E_PASSWORD` env vars override the account a spec uses (each spec has its own default)
- The charts spec needs the apflora demo data in the dev db: `npm run apflora:import:test` (the import restarts the electric container to drop stale shape snapshots)

### Database & Types

```bash
npm run models:generate      # Generate TypeScript types from PostgreSQL schema (Kanel)
npm run sync-sql             # Mirror SQL files from backend/db/init/ → backend-dev & src/sql
npm run sync-sql:check       # Verify SQL files are in sync (pre-commit hook)
```

### Documentation

```bash
npm run docs:build    # Build docs from docsMd/ + docsHtml/ → docs/docs/
npm run i18n:extract  # Extract react-intl strings
npm run i18n:punctuation:check  # Check i18n punctuation consistency
```

### One-time Setup

Prerequisites: Node 24 (see `.nvmrc`), Docker, and the `caddy` binary on PATH.

```bash
npm install                                     # also patches node_modules (see devRemarks in package.json)
npm run hooks:install                           # git pre-commit hooks (sync-sql + i18n checks)
cp backend-dev/.env.example backend-dev/.env    # dev-stack env, local-only values
cd backend-dev && docker compose up -d --build  # db, postgrest, electric, auth — first build takes a while
npm run dev                                     # app on http://localhost:5176
```

---

## Deployment

- **Frontend:** `npm run deploy` (from main, see Common Commands) — bumps the version, pushes main, updates the `production` branch; Netlify builds and deploys it. Nothing else to do.
- **Backend:** manual and owner-only, via `deploy-backend.sh` (gitignored, lives only on the owner's machine). Agents: do not attempt backend deploys — ask the owner. The production DB is experimental and is rebuilt from scratch rather than migrated (see dev-documentation.md §6).

---

## Architecture

### Database-First Design

- **Source of Truth:** `backend/db/init/` — Edit SQL files ONLY here
- **Auto-synced mirrors:** `backend-dev/db/init/` and `src/sql/` (via `sync-sql`)
- **Type generation:** Kanel reads PostgreSQL schema and generates TypeScript types to `src/models/`
- **Runtime:** ElectricSQL syncs PostgREST → PGlite (in-browser PostgreSQL)

### Key Directories

| Path                 | Purpose                                                     |
| -------------------- | ----------------------------------------------------------- |
| `src/components/`    | React components (Auth, Map, Forms, Tree, etc.)             |
| `src/routes/`        | TanStack Router configuration and route components          |
| `src/formsAndLists/` | CRUD forms/lists for each domain entity                     |
| `src/modules/`       | Core business logic, utilities, sync orchestration          |
| `src/models/`        | **Generated** TypeScript types from database (DO NOT edit)  |
| `src/i18n/`          | Internationalization files (de, en, fr, it)                 |
| `src/sql/`           | **Auto-synced** SQL files from backend (DO NOT edit)        |
| `backend/db/init/`   | **SQL source of truth** — edit here, run `sync-sql`         |
| `backend-dev/`       | Development backend (auth, GBIF, docker-compose)            |
| `docs/`              | Documentation system (sources in `docsMd/` and `docsHtml/`) |

### Data Flow

1. **PostgreSQL** → PostgREST API → **ElectricSQL** → **PGlite** (browser)
2. Role-based sync filters in `src/modules/startSyncing.ts` control what data reaches the client
3. Optimistic updates queue locally, sync via ElectricSQL on reconnection
4. JWT Bearer tokens authorize both PostgREST writes and ElectricSQL subscriptions

---

## Important Constraints

### SQL Files — Single Source of Truth

- **Edit ONLY:** `backend/db/init/` and shared generator files in `backend/db/`
- **NEVER edit:** `backend-dev/db/init/`, `src/sql/` (these are auto-synced)
- Pre-commit hook runs `sync-sql:check` — will block commits if drift detected
- After editing SQL, run `npm run sync-sql` before committing

### Type Generation

- `src/models/` is **generated** by Kanel from PostgreSQL schema
- Regenerate with `npm run models:generate` after schema changes
- Requires `KANEL_DATABASE_URL` or `DATABASE_URL` env var

### User Roles & Permissions

**Enum (`user_roles_enum`, low → high):** `read-specific < read-all < write-specific < write-all < design < own`
Conceptually: reader (`read-*`) < writer (`write-*`) < designer (`design`) < owner (`own`)

- **Owner** — Can set designer roles; auto-set on creation by triggers
- **Designer** — Can set writer/reader roles
- **Writer** — Can modify data
- **Reader** — Read-only

**Key Rules:**

- Roles cascade down hierarchy (project → subproject → place)
- Higher roles at lower levels extend downward; parent role required for sync
- Setting lower role at higher level nukes higher roles at lower levels (inform users!)
- Only triggers set owner roles; users cannot
- All writes checked server-side via JWT; permission denied (42501) reverts client-side

**Implementation:**

- `backend/db/init/12_writePermissionTriggers.sql` — Server-side write checks
- `src/modules/fetchPostgrestToken.ts` — JWT token for PostgREST + ElectricSQL
- `src/modules/executeOperation.ts` / `observeOperations.ts` — Optimistic updates with rollback on 42501
- To test a role end-to-end: `e2e/helpers.ts` (`ensureUser` + `grantRoles` + `login`) provisions a user with any role against the dev stack

### Authentication & Email Verification

- **better-auth** with OAuth (GitHub, Google) and email/password
- **Email verification grace period:** 1 hour from account creation
- Unverified users see countdown banner; expired verification forces logout
- Dev env: verification **disabled by default** (set `REQUIRE_EMAIL_VERIFICATION=true` to test)

**Relevant files:**

- `src/modules/emailVerificationGrace.ts` — Grace deadline logic
- `src/components/EmailVerificationBanner.tsx` — Countdown banner with OTP flow
- `src/routes/data/route.tsx` — Route guard enforcing expiry

### Styling Conventions

- **CSS Modules** for component styles (`.module.css`)
- **Inline styles** for dynamic values only
- Global styles in `src/style.css`
- CSS class naming: camelCase exports via Vite config

### App Admins

- Configured via `VITE_APP_ADMIN_EMAILS` env var (comma-separated emails)
- Use `src/modules/appAdmins.ts` to check admin status — **do not hardcode**

---

## Offline-First & Sync

**PGlite** (in-browser PostgreSQL) enables offline work:

- Data syncs to IndexedDB via ElectricSQL
- Field edits write PGlite immediately (labels stay live) but are aggregated
  into ONE queued operation per row and form session (`src/modules/operationAggregation.ts`),
  flushed on form blur, navigation, tab hide/close or ~5s of inactivity
- Operations queue locally, sync when connection restored
- **Conflict resolution:** "Time Machine" view shows who changed what when
- **Data export:** Users can export all data at any time

**Key files:**

- `src/modules/startSyncing.ts` — Sync orchestration, role-based filters
- `src/modules/observeOperations.ts` — Operation queue & conflict handling

---

## Geospatial Features

**Leaflet maps** with WMS/WFS layers:

- Swiss projection (LV95) support via `proj4` + `proj4leaflet`
- Geospatial calculations (distances, extents) run in PostGIS inside PGlite — see `src/modules/geoQueries.ts`; Turf is only used for data that never touches the database (WFS responses, drawn geometries)
- WMS capabilities parsing via `wms-capabilities`

---

## Internationalization

**react-intl** with 4 languages: German (de), English (en), French (fr), Italian (it)

- Messages in `src/i18n/` per language
- Extract new strings with `npm run i18n:extract`
- Fallback: `label_de` used if translation missing

---

## Documentation System

- **Sources:** `docs/docsMd/` (Markdown) and `docs/docsHtml/` (HTML)
- **Build:** `npm run docs:build` → `docs/docs/` (HTML fragments)
- **NEVER edit** `docs/docs/` directly — only sources
- App imports pre-built HTML for instant rendering
- Metadata in `docs/metadata.ts` (id, label, order, isTechnical)

---

## Development Backend

**Start:** `cd backend-dev && docker compose up -d --build` (uses `backend-dev/.env` — copy from `backend-dev/.env.example`).

**Docker Compose** (`backend-dev/docker-compose.yml`) spins up:

- PostgreSQL with PostGIS
- PostgREST API
- ElectricSQL sync server
- Auth server (Node.js + better-auth)
- GBIF integration

**Caddy proxy** (`npm run caddy:proxy`) routes:

- `localhost:5176` → Vite dev server
- `/auth` → Auth server
- `/api` → PostgREST
- `/electric` → ElectricSQL

**Local ports:**

| Port  | Service                                                        |
| ----- | -------------------------------------------------------------- |
| 5176  | Vite dev server + Caddy proxy (the app)                        |
| 3001  | ElectricSQL proxy (Caddy, HTTPS with local CA)                 |
| 3002  | PostgREST                                                      |
| 3003  | Auth server (better-auth)                                      |
| 54321 | PostgreSQL (not 5432 — must coexist with other local projects) |

**Dev login:** `test@test.ch` / `test-test` — the dev auth server provisions this preview user automatically and idempotently (email verified, `own` role on every project, so all seeded data is visible). Override via `PREVIEW_TEST_EMAIL` / `PREVIEW_TEST_PASSWORD` in `backend-dev/.env`.

Other dev accounts stop working after the 1-hour email-verification grace period; fix with:

```bash
docker exec ps_db psql -U postgres -d ps -c "UPDATE users SET email_verified = TRUE WHERE email = 'x@y.ch'"
```

---

## Testing GBIF Import

GBIF observation import runs from `backend-dev/gbif/`:

```bash
cd backend-dev/gbif
node gbif-import.mjs
```

---

## Environment Variables

No env file is needed for `npm run dev`, `npm run build`, or the unit tests. Vite reads `VITE_*` vars from the root `.env` if present.

| Task                                        | Variable                                      | Notes                                                                                                     |
| ------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Type generation (`npm run models:generate`) | `KANEL_DATABASE_URL` (or `DATABASE_URL`)      | Root `.env`, read via dotenv                                                                              |
| App-admin features in dev                   | `VITE_APP_ADMIN_EMAILS`                       | Comma-separated emails, root `.env`                                                                       |
| Dev backend stack                           | `backend-dev/.env`                            | Copy from `backend-dev/.env.example`                                                                      |
| Email verification in dev                   | `REQUIRE_EMAIL_VERIFICATION` (default: false) | `backend-dev/.env`; set `true` to test the verification flow                                              |
| Client error telemetry                      | `VITE_ERROR_TELEMETRY`                        | Set `true` in the Netlify env; client errors land in `public.error_report` (see dev-documentation.md §11) |

---

## Pre-commit Hooks

After `npm run hooks:install`, git hooks run:

1. `sync-sql:check` — Block commit if SQL files out of sync
2. `i18n:punctuation:check` — Ensure consistent punctuation in translations

Hooks configured in `.githooks/pre-commit`.

---

## Common Patterns

### CRUD Operations

Each domain entity has a form/list in `src/formsAndLists/{entity}/`:

- `index.tsx` — List view
- `Form.tsx` — Create/edit form
- Uses shared components from `src/components/` (e.g., `Filters`, `Sorter`)

### Route Structure

**TanStack Router** with file-based routing in `src/routes/`:

- `_layout.*` — Layout wrappers
- `{id}.tsx` — Parameterized routes
- `-` prefix = file ignored by router (see `routeFileIgnorePrefix` in vite.config.ts)

### State Management

- **Jotai** for local component state
- **TanStack Query** for server state (caching, refetching)
- **PGlite** as single source of truth for synced data

---

## Performance Considerations

- **Role changes** trigger batched updates to cascading tables
- **Sync subqueries** filter by user role — must be efficient
- **Import operations** — Batch large writes to avoid permission check overhead
- **Critical:** Changing roles must NOT re-sync rows user already has access to (avoids array-column-per-role approach)

---

## Resources

- **User docs:** `/docs` route in-app
- **Developer docs:** `dev-documentation.md`
- **README:** `README.md` (user-facing features)
- **Optimization backlog:** `optimization-backlog.md`
