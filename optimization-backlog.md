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

- [ ] **4. SqlInitializer re-runs schema surgery on every page load**
  Big ALTER/trigger script plus `DELETE ... DISTINCT ON` dedup scan over
  `layer_presentations` each load ([SqlInitializer.tsx:47](src/components/SqlInitializer.tsx)).
  **Fix:** schema-version stamp — skip when version matches.

- [ ] **5. Missing composite indices**
  - `place_levels (project_id, level)` — filtered together in
    places/subproject/check navData, only single-column indices exist.
  - `charts (project_id, for_subprojects)`.

- [ ] **6. Startup shell audit**
  Eager entry 428 KB gz (~630 KB with vendor chunks before first paint). Fluent core
  is irreducible, but audit for app code that belongs in route chunks. `cpexcel.full`
  (171 KB gz, SheetJS legacy codepage tables) droppable unless ancient `.xls` imports
  in exotic encodings matter.

- [ ] **7. Jotai details**
  - `operationsQueueAtom` ([store.ts:711](src/store.ts)) re-serializes the entire write
    queue to localStorage on every queued op.
  - `designingAtom` is one `Record<projectId, boolean>` → any toggle re-renders every
    subscriber.
  - `isRowOpen` deep-compares every row against every open node
    ([useVisibleTreeRows.ts:16](src/components/Tree/virtual/useVisibleTreeRows.ts)) —
    O(rows × open nodes); use a `Set` of joined paths.

- [ ] **8. Smaller things**
  - Tree carries `'use no memo'` — the hottest render path is the one React Compiler
    skips.
  - `TableLayersProvider` keeps a full-table `COUNT(*)` live query on `observations`
    running at all times.
  - Only the tree is virtualized; observation lists after GBIF imports are not.
  - `HistoryCompare` polls PostgREST every 2 s
    ([useHistoryRecords.ts:58](src/components/shared/HistoryCompare/useHistoryRecords.ts)).
  - `UploaderContext` hands consumers a fresh `createRef()` every render
    ([LayoutProtected/index.tsx:75](src/components/LayoutProtected/index.tsx)).
  - `SwitchField` commits per toggle → full ~600-line form re-render per round trip.
