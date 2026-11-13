# Optimization Backlog

Findings from the 2026-11-13 performance review. Work off one by one.

- [x] **1. Tree count-query N+1 explosion** (branch: `perf/tree-count-rollups`)
  Each open tree row mounts a `Registrar` running its own navData hook
  ([Registrar.tsx:32](src/components/Tree/virtual/Registrar.tsx)), each issuing its own
  battery of `count(*)` CTEs — 18 per project node
  ([useProjectNavData.ts:131](src/modules/useProjectNavData.ts)), ~19 per subproject
  ([useSubprojectNavData.ts:97](src/modules/useSubprojectNavData.ts)), 35 in design mode.
  Ten open projects ≈ 180 separate live queries, re-running on writes to any touched
  table; each sibling also re-queries identical SQL (e.g. every `usePlacesNavData`
  separately live-queries `projects`).
  **Done:** `NavDataProvider` (mounted in LayoutProtected) runs 11 shared live
  queries — projects-row lookup, tagged-union count rollups (`GROUP BY
  project_id` / `GROUP BY subproject_id` with `count(*) FILTER` for filtered
  variants), composite-grouped counts for files/qc/exports (one scan feeds both
  levels), `place_levels`, and subproject `table_views`. The nav hooks keep their
  signatures and consume the rollups via `useNavRollups()`
  ([navRollupsContext.ts](src/modules/navRollupsContext.ts)); their per-node
  queries shrank to the node's own row / children list. N × ~20 live queries → 11.
  Follow-up idea (not done): roll up the per-parent child counts in
  usePlacesNavData/useObservationsNavData etc. the same way.

- [x] **2. Service worker precaches the wrong things** (branch: `perf/sw-precache`)
  Precache hoarded 22.9 MB up front — including the 410 KB gz marker-icon chunk and
  xlsx/doc-viewer chunks a first-time visitor never opens — while the ~9.7 MB PGlite
  wasm that actually makes the app work offline was *not* precached
  ([vite.config.ts:67](vite.config.ts) globPatterns had no `wasm`; wasm survived only
  via Netlify's immutable HTTP cache, which the browser may evict).
  **Done:** wasm precached (all three PGlite wasm files); cold chunks (md icons,
  xlsx + cpexcel, react-doc-viewer, SqlEditorField — 3.7 MB raw) excluded from
  precache and runtime-cached CacheFirst on first use. Precache total 22.9 → 19.3 MB
  including the wasm now. Verified against a `vite preview` build: wasm in precache,
  cold chunks absent, offline-sync e2e passes.

- [x] **3. Map pan path** (branch: `perf/map-pan-path`)
  - `mapViewportBoundsAtom` was written every animation frame
    ([BoundsListener.tsx](src/components/Map/BoundsListener.tsx)); its only
    subscriber ([Active/Content.tsx](src/components/Map/LeftMenuDrawer/Layers/Actives/Active/Content.tsx),
    760 lines) reads bounds only inside a click handler → re-render per frame.
    **Done:** atom written on moveend/zoomend only; Content reads it at click time
    via `store.get()`.
  - WFS refetched on every `moveend` (plus `dragend`/`zoomend` — up to 3× per
    interaction), no debounce, no bbox-overlap check, full-GeoJSON reprojection
    each time ([WFS.tsx](src/components/Map/layers/VectorLayer/WFS.tsx)).
    **Done:** single debounced (600 ms) moveend handler; refetch skipped when the
    viewport stays inside the padded bbox of the last successful fetch at the
    same zoom.
  - `ReactDOMServer.renderToString` per point marker (TableLayer, PVLGeom, WFS)
    and per feature popup (PVLGeom).
    **Done:** marker icons cached per variant in
    [markerIconHtml.tsx](src/components/Map/layers/markerIconHtml.tsx); PVLGeom
    popups render lazily on open; TableLayer's dataKey memoized.
  - Jotai atom writes in render bodies (WFS.tsx, PVLGeom.tsx). **Done:** moved
    into effects.
  - Remaining (left as is): `Layer.tsx:143` mutates `wmsLayer.opacity` during
    render — idempotent prop-object tweak, not an atom write; fixing it means
    restructuring how WMS opacity is passed down.

- [x] **4. SqlInitializer re-runs schema surgery on every page load** (branch: `perf/sql-init-stamp`)
  Big ALTER/trigger script plus `DELETE ... DISTINCT ON` dedup scan over
  `layer_presentations` each load ([SqlInitializer.tsx](src/components/SqlInitializer.tsx)).
  **Done:** the whole routine is gated by a content hash (FNV-1a) over every sql
  source it can run — the inline heal script (extracted to a const, verified
  byte-identical), the dedup DELETE, all sql files and the geometry repair
  module. The hash is stamped into a local-only `_ps_local_meta` table; an
  unchanged stamp skips everything (one SELECT per boot instead of hundreds of
  statements). The stamp is written only when every statement succeeded, so
  partial runs retry; changing any sql source re-runs the routine once.
  Verified in e2e: reload-crash boots once and reloads twice — the two reloads
  both log the skip.

- [x] **5. Missing composite indices** (branch: `perf/composite-indices`)
  - `place_levels (project_id, level)` — filtered together in
    places/subproject/check navData, only single-column indices exist.
  - `charts (project_id, for_subprojects)`.
  **Done:** added to `backend/db/init/04_createTables.sql` (mirrored via sync-sql)
  and to the SqlInitializer heal script so existing local databases get them too
  (the hash stamp re-runs the heal once). Index usability verified with EXPLAIN
  against the dev db. Production server db still needs the two CREATE INDEX
  statements applied with the next migration/deploy.

- [x] **6. Startup shell audit** (branch: `perf/shell-audit`)
  Eager entry was 428 KB gz (~630 KB with vendor chunks before first paint); the
  entry contained the whole Fluent UI suite (table, tree, carousel, combobox, ...)
  hoisted as shared modules of the route chunks, plus arktype.
  **Done:** eager closure is now 344 KB gz total (entry 118 KB gz):
  - a `vendor-fluent` advancedChunks group claims every fluent package the shell
    does not use (`includeDependenciesRecursively: false`, core excluded via
    lookahead) — the heavy fluent code became a lazy shared chunk
  - root: any import from the `@fluentui/react-components` barrel keeps
    re-export bindings to every fluent package alive. The eager files
    (App, NotFoundRoot, RouterErrorBoundary, theme.ts) now import from the
    individual packages (`@fluentui/react-provider`, `-button`, `-theme`,
    added as direct deps)
  **Done additionally (branch: `perf/arktype-out-of-entry`):** the three
  arktype `validateSearch` schemas (`_layout.auth`, `data`, observation-import
  tab) replaced by plain validators — the params are only set programmatically
  with proper types. Entry chunk 118 → 73 KB gz, eager total 344 → 299 KB gz.
  **Post-deploy fix (branch: `fix/vendor-fluent-motion`):** the production
  build crashed (`tokens.durationFast` / `fontFamilyBase` of undefined) —
  `includeDependenciesRecursively: false` produced chunks whose cross-chunk
  bindings were uninitialized at module evaluation. Replaced with a
  `vendor-fluent-core` group (recursive capture, claims the shared fluent
  infrastructure + griffel/tabster/embla deps BEFORE the heavy group) so
  heavy→core chunk edges stay acyclic; `use-sync-external-store` moved into
  vendor-react (fluent's recursive capture had claimed it, dragging vendor-fluent
  eager via vendor-tanstack). Eager total 375 KB gz. Verified by serving the
  built bundle on localhost:5176 against the dev backend and driving a real
  login + deep tree in Chromium — the e2e suite runs against the dev server
  where chunking does not exist, so it cannot catch this class of bug.
  `cpexcel.full` (171 KB gz, SheetJS legacy codepages) is inside the lazily
  loaded xlsx chunk; dropping it entirely is a product decision (legacy .xls
  imports in non-UTF8 encodings).

- [x] **7. Jotai details** (branch: `perf/jotai-details`)
  - `operationsQueueAtom` ([store.ts](src/store.ts)) re-serialized the entire write
    queue to localStorage on every queued op. **Done:** the queue's storage
    coalesces writes per microtask — bulk imports enqueue many operations in one
    tick (previously O(n²) bytes re-serialization) and persist once per burst,
    still before paint/yield. Falls back to memory-only where localStorage is
    unavailable (node/tests), matching jotai's default fallback.
  - `designingAtom` is one `Record<projectId, boolean>` → any toggle re-rendered
    every subscriber. **Done:** `isDesigningAtom(projectId)` factory returns
    memoized derived boolean atoms; the per-node nav hooks (the hot subscribers)
    use it. Form-page readers keep subscribing to the record (rare toggle,
    negligible).
  - `isRowOpen` deep-compared every row against every open node
    ([useVisibleTreeRows.ts](src/components/Tree/virtual/useVisibleTreeRows.ts)) —
    O(rows × open nodes) with `isEqual`. **Done:** derived
    `treeOpenNodesSetAtom` (Set of joined paths); all ~146 nav hooks and the tree
    row flattener do `set.has(path.join('/'))` instead. Path segments are url
    parts/uuids and never contain '/'. `tree/isNodeOpen.ts` keeps isEqual (write
    paths, called a few times per navigation).

- [x] **8. Smaller things** (branch: `perf/small-things`)
  - `TableLayersProvider` kept a full-table `COUNT(*)` live query on `observations`
    running at all times — rescanning the whole table on every observation write.
    **Done:** replaced with `SELECT EXISTS(...)` (index probe, stops at first row);
    as a boolean effect dependency it only re-fires the layer-creation effect when
    observations appear/disappear.
  - `HistoryCompare` polled PostgREST every 2 s. **Done:** 10 s interval — the
    view is route-mounted (only polls while a history page is open), and
    refetchOnWindowFocus still refreshes instantly on tab return.
  - `UploaderContext` handed consumers a fresh `createRef()` every render.
    **Done:** stable `useRef` — one ref object for the app's lifetime.
  - Tree carries `'use no memo'` — **left as is, deliberate:** TanStack Virtual
    is incompatible with React Compiler memoization (documented in
    [Tree/index.tsx](src/components/Tree/index.tsx)), and Registrar dispatches
    dynamic hooks (`config.hook(params, nav)`) which the compiler cannot prove.
  - Observation lists are not virtualized — **assessed, not done:** the lists
    render simple anchor rows via the shared `Row` component; virtualizing them
    is a product-level UI change (scroll container, filters, mobile behavior)
    worth doing deliberately, not as a perf side quest.
  - `SwitchField` commits per toggle → full form re-render after the live-query
    round trip — **left as is:** commits are the app's write model (every field
    type works this way; text inputs merely buffer until blur, switches have no
    blur equivalent), and server-side batching already happens via
    operationAggregation. Deferring the local write would change UX semantics.
