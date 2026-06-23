# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
```

### Code Quality
```bash
npm run lint          # ESLint (max 0 warnings allowed)
npm run format        # Prettier formatting
```

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
```bash
npm install
npm run hooks:install  # Install git pre-commit hooks
```

---

## Architecture

### Database-First Design

- **Source of Truth:** `backend/db/init/` — Edit SQL files ONLY here
- **Auto-synced mirrors:** `backend-dev/db/init/` and `src/sql/` (via `sync-sql`)
- **Type generation:** Kanel reads PostgreSQL schema and generates TypeScript types to `src/models/`
- **Runtime:** ElectricSQL syncs PostgREST → PGlite (in-browser PostgreSQL)

### Key Directories

| Path | Purpose |
|------|---------|
| `src/components/` | React components (Auth, Map, Forms, Tree, etc.) |
| `src/routes/` | TanStack Router configuration and route components |
| `src/formsAndLists/` | CRUD forms/lists for each domain entity |
| `src/modules/` | Core business logic, utilities, sync orchestration |
| `src/models/` | **Generated** TypeScript types from database (DO NOT edit) |
| `src/i18n/` | Internationalization files (de, en, fr, it) |
| `src/sql/` | **Auto-synced** SQL files from backend (DO NOT edit) |
| `backend/db/init/` | **SQL source of truth** — edit here, run `sync-sql` |
| `backend-dev/` | Development backend (auth, GBIF, docker-compose) |
| `docs/` | Documentation system (sources in `docsMd/` and `docsHtml/`) |

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

**Hierarchy:** `owner > designer > writer > reader`

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
- Turf library for geospatial calculations (buffer, distance, etc.)
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

---

## Testing GBIF Import

GBIF observation import runs from `backend-dev/gbif/`:

```bash
cd backend-dev/gbif
node gbif-import.mjs
```

---

## Environment Variables

**Required for type generation:**
- `KANEL_DATABASE_URL` or `DATABASE_URL` — PostgreSQL connection string

**Required for app admin access:**
- `VITE_APP_ADMIN_EMAILS` — Comma-separated email list

**Dev backend (see `backend-dev/docker-compose.yml`):**
- `DATABASE_URL`
- `POSTGREST_JWT_SECRET`
- `REQUIRE_EMAIL_VERIFICATION` (default: false)

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
- **Issues/tasks:** `tasks/` directory
