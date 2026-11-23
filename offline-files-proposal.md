# Proposal: mark files as available offline

Status: **implemented** (2026-11-23). One deviation from the text below: the
service worker is a custom `src/sw.ts` (vite-plugin-pwa `injectManifest`,
replacing GenerateSW) because the offline-files route must serve the
'offline-files' cache **without opportunistically caching** other CDN
responses — GenerateSW's declarative CacheFirst would cache everything the
app views, and unmarking could then never free the space. Written while two
other work streams were in flight (WMTS/tile layers; owner/designer-only
project & subproject creation) — overlap with them is limited to textual
merges.

## Goal

- **Users** can mark a single file "offline verfügbar" — after that, a preview
  image and the file itself are available on the device with no connectivity.
- **Owners/designers** can mark **all files of a table** offline with one
  switch (files on level-1 places, level-2 places, actions, checks).

Scope is **reading** marked files offline. Offline *uploading* of files stays
out of scope (the uploader loads its CSS/JS from the jsdelivr CDN — existing
TODOs in `src/formsAndLists/files.tsx:60-61` and `file/Uploader.tsx:256-258`).

## What already exists and anticipates this

- **Binaries live in Uploadcare**, fetched by the client via unauthenticated,
  immutable CDN transform URLs: list thumbnails `-/resize/x50/…`
  (`src/formsAndLists/files.tsx:100` — images *and* PDFs, page 1), form images
  `-/resize/{w}x/…` (`file/index.tsx:40-42`), fullscreen `-/preview/{w}x{h}/…`
  (`filePreview/index.tsx:70-108`), PDFs natively via `<object data={url}>`,
  other docs via `@cyntler/react-doc-viewer` fetching `url`.
- **`projects.files_offline boolean DEFAULT FALSE`**
  (`backend/db/init/04_createTables.sql:229`) already exists and is surfaced in
  the project Configuration form ("Dateien lokal speichern (offline
  verfügbar)", `project/Configuration/index.tsx:849-859`) but is consumed by
  nothing — a prepared-but-inert hook.
- **Table-level feature switches live on `place_levels`** (`place_files`,
  `action_files`, `check_files`, `04_createTables.sql:344-349`), edited by
  designers in `src/formsAndLists/placeLevel/Form.tsx`. The offline flags have
  a natural home next to them.
- **`files` syncs whole rows** via Electric with an explicit column list
  (`src/modules/shapeDefinitions.mjs:427-452`) including the dormant
  `file`/`preview` bytea and `preview_uuid` columns.
- **Write rules**: file rows are guarded by `enforce_multilevel_write()`
  (writer or higher on the file's scope, `12_writePermissionTriggers.sql`);
  table-level settings (e.g. `place_levels`, `form_designs`) are design-gated
  via `user_can_design_project()`.
- **PWA**: vite-plugin-pwa/workbox already ships a CacheFirst runtime-caching
  route for cold chunks (`vite.config.ts:104-112`) — the pattern to extend.
  The marks themselves are ordinary row writes, so marking while offline rides
  the existing operations queue.
- The per-form-header **"show in map" toggle** added to the layer forms
  (`useLayerActivation`) is the UI pattern for the per-file toggle.

## Decisions

### D1 — where the bytes live offline: device cache, not the database (recommended)

**Option A (recommended): Service-worker Cache Storage.** The client fetches
`url` (original) and the preview transforms from the Uploadcare CDN and stores
them via `cache.put()` into a dedicated cache (`offline-files`); a workbox
`CacheFirst` route on `https://ucarecdn.com/**` serves them offline. No
backend, no new endpoint, no schema change for the bytes, and per-device
storage (only the marking user's device downloads).

**Option B (rejected): sync the dormant `files.file`/`files.preview` bytea
columns.** Tempting — they already sync — but Electric would push every
marked file's bytes to **every** project member (shape columns are shared
across users, not per-user), JSON-encoded through PostgREST/Electric with
heavy size overhead, and the whole row re-syncs on every touch. Bad for sync
health and for everyone's storage; rejected.

### D2 — who can mark a single file: a shared flag on the file row (recommended)

`files.offline boolean DEFAULT false`, toggled as a normal file-row write
(writer or higher, same `enforce_multilevel_write` rule as every other file
edit). The offline set is therefore shared with the team, marks sync across
all of a user's devices, and history/Time Machine shows who marked what.

**Alternative (deferred): per-user marks** — a `file_offline_marks(user_id,
file_id)` table synced with `where user_id = $1` would let *readers* mark
files and keep marks personal. Costs a new table + shape entry +
`apply_operations` support + a self-write permission trigger. Revisit only if
readers turn out to need offline marking; readers today can consume whatever
the team marked (table flags) while online, and rarely work in the field.

## Design (for the recommended options)

### Marks (schema)

```sql
-- on files (next to the dormant bytea columns):
offline boolean DEFAULT false   -- per-file mark, writers or higher

-- on place_levels, next to place_files/action_files/check_files:
place_files_offline  boolean DEFAULT false   -- designers or higher
action_files_offline boolean DEFAULT false
check_files_offline  boolean DEFAULT false
```

- `files_history` picks the column up automatically (`LIKE files`); history
  triggers copy whole rows.
- Add `offline` to the `files` entry in `src/modules/shapeDefinitions.mjs`
  **and** both server mirrors (`npm run sync-sql`), then
  `npm run models:generate`. Deploying resyncs the files shape once
  (metadata-only rows, cheap).
- **`projects.files_offline` becomes the feature gate**: when false (default),
  the marking UI is hidden and nothing is cached; when true, the effective set
  below applies. This gives owners the kill switch for storage on members'
  devices and makes the existing Configuration switch meaningful. (Simpler
  alternative: drop the flag and the gate entirely — both are cheap to
  change.) Project- and subproject-attached files have no table flag; users
  mark those individually (usually a handful).

### Effective set (client, one live query on PGlite)

A file is effectively offline iff the project gate is on **and** (`files.offline`
**or** the parent table's flag). The parent flag comes from the file's
`place_id`/`action_id`/`check_id` → the owning `place_levels` row for that
place's level.

### Download & serve (SW + orchestrator)

- Workbox route in `vite.config.ts`:
  `urlPattern: /^https:\/\/ucarecdn\.com\//`, `CacheFirst`,
  `cacheName: 'offline-files'`, `cacheableResponse: { statuses: [0, 200] }`
  (0 = opaque; verify Uploadcare sends `Access-Control-Allow-Origin: *` — it
  does per their CDN docs — then fetch in cors mode and tighten to `[200]`).
  Implemented as a custom route in `src/sw.ts` that consults the cache first
  and passes network responses through **uncached** (see status note above).
- New `src/modules/offlineFiles.ts`: computes the effective set from the live
  query; for each file fetches and `cache.put()`s the **x50 thumbnail, one
  fixed preview transform** (e.g. `-/preview/1600x1600/`, with the form and
  fullscreen views pointed at that fixed variant so cache keys are
  deterministic) **and the original `url`**. Skips already-cached URLs;
  concurrency-limited queue; pauses when `onlineAtom` is false; reconciles on
  boot and on every mark/flag change — downloads missing, and deletes cache
  entries that left the effective set (unmark, table flag off, gate off, file
  deleted) via `cache.keys()` diffing.
- Size guardrail: `files.size` is known — skip and flag files above a cap
  (e.g. 50 MB) with a notice in the list rather than silently eating quota.

### Preview images

- **Images and PDFs already have CDN-transform previews today** (PDF page 1
  renders through the same `-/resize/x50/` transform, `files.tsx:95-101`) —
  caching those URLs delivers offline previews for free.
- **Office documents** (docx/xlsx/…) have no preview even online (icon
  fallback; the doc viewer fetches the file itself) — offline parity is the
  cached file plus the icon. Real document thumbnails need the server-side
  Uploadcare document conversion (secret key) sketched in the commented-out
  plan in `file/Uploader.tsx:178-221`, which would also fill `preview_uuid` —
  v2, orthogonal to offline.

### UI

- **File form header**: offline toggle (mirror the layer forms' show-in-map
  toggle); **files list**: per-row state icon (not marked / downloading /
  cached / too large / failed).
- **Place-level form**: three switches next to the existing "Dateien"
  switches (designers already see this form; `place_levels` is design-gated).
- **Configuration**: the existing switch gets its gate meaning + hint text.
- A small offline-files status view (count, bytes via
  `navigator.storage.estimate()`, per-table bulk state) reachable from the
  files list header. `requestPersistentStorage` is already requested at boot.
- i18n: 4 languages via `npm run i18n:extract`.

## Interaction with the in-flight work streams

- **Tile layers (WMTS)**: shared files are `04_createTables.sql` (different
  tables), `shapeDefinitions.mjs` (different entries) and the sync-sql
  mirrors — textual merges only, no semantic overlap.
- **Owner/designer project creation rules**: this proposal reuses
  `user_can_write_*`/`user_can_design_project` as they stand today; if that
  stream reshapes the role helpers, it's a small rebase.

## Caveats

- **iOS**: non-installed PWA storage can be evicted after 7 days of disuse;
  installed PWA + persistent storage mitigate (dev-documentation.md §13) —
  same exposure as all synced data today.
- First download needs connectivity; marks made offline download on
  reconnect (reconcile on `onlineAtom` flip).
- Uploadcare URLs are public (public-key CDN, no per-user auth) — caching
  them on the device does not change the security posture.
- The service worker is **not active in `npm run dev`** (no `devOptions` in
  `vite.config.ts`) — offline-serving e2e needs a production build
  (`npm run build && npm run preview`) or temporarily enabling
  `devOptions.enabled`.
- Logout wipes local synced data — cached files go with it (consistent with
  today's behavior).

## Effort sketch

1. SQL: `files.offline`, 3 `place_levels` flags, `projects.files_offline`
   comment as gate; `npm run sync-sql`; `npm run models:generate`;
   `files` entry in `shapeDefinitions.mjs` + mirrors.
2. Workbox route; `offlineFiles.ts` orchestrator (queue, reconcile, quota) +
   store atoms.
3. UI: file form toggle, list indicator, placeLevel switches, Configuration
   hint, status view, i18n.
4. Unit tests: effective-set SQL against PGlite fixtures; e2e: mark → cache
   contains the URLs → offline render (production build).
5. `npm run verify` + e2e against the dev stack.

Roughly 2–3 days including verification.
