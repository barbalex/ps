# Viewport culling for apf2's map layers (port of the ps implementation) — amended: 50 % padding per axis

apf2 loads every map feature through three PostgREST RPCs (`query_pop`, `query_tpop`, `query_beob`) whose `p_filter` jsonb is compiled by `apflora.compile_filter` into SQL. Scale today: **beob 500k rows**, tpop 21.5k, pop 10.9k — all loaded per layer, unfiltered. The port rides the existing filter path: a padded, debounced viewport envelope enters `p_filter` as `{"geomPoint": {"intersects": <polygon>}}`, compiled to `st_intersects(geom_point, ...)` on the existing GiST indexes. **Per your amendment: the envelope is padded 50 % per axis** (fetch window = 2× the viewport per axis → pans refetch much less often; more features stay loaded around the edges).

## 1. Backend: add `intersects` to `compileFilter.sql`

In `sql/postgrest/compileFilter.sql`, add an `intersects` WHEN-branch next to `coveredBy` (line ~425): `public.st_intersects(%s, public.st_geomfromgeojson(%L::jsonb))` with the same `v_is_geometry` guard. Update the header doc and the supported-operators error message. Apply to the dev db: `docker exec -i apf_db psql -U postgres -d apflora -v ON_ERROR_STOP=1 < sql/postgrest/compileFilter.sql`. (Production SQL via `scripts/apply-production-sql.sh` only when you ask — never run it on my own, per apf2's CLAUDE.md.)

## 2. Viewport envelope module (port of ps's `viewportEnvelope.ts`)

New `src/components/Projekte/Karte/useViewportEnvelope.ts`, next to `useProgressiveCount.ts`/`useDisplayedLabels.ts`:

- Pure functions ported from ps: `padBounds` (**50 % per axis**, world-clamped), `envelopeContains`, `resolveViewportEnvelope` (containment skip — no re-emit while the viewport stays inside the last padded window).
- `viewportFilterPolygon(envelope)` → GeoJSON Polygon `[[[w,s],[e,s],[e,n],[w,n],[w,s]]]` for the filter.
- `useViewportFilterEnvelope()`: reads a new non-persisted `mapViewportBoundsAtom` (`src/store/map.ts`); first value emits immediately, later values debounced 400 ms (`use-debounce`, existing dep) with the containment skip. Returns the polygon GeoJSON or `null`.
- `MapPersister.tsx` (already listening to `moveend`): also `store.set(mapViewportBoundsAtom, {swLat, swLng, neLat, neLng})` on moveend and once on mount (its existing mount effect).

## 3. The six apflora layers

`Pop/index.tsx`, `Tpop/index.tsx`, `BeobZugeordnet/index.tsx`, `BeobNichtBeurteilt/index.tsx`, `BeobNichtZuzuordnen/index.tsx`, `BeobZugeordnetAssignPolylines/index.tsx` — each already derives its query filter locally from the shared tree atoms (e.g. `popFilter = cloneDeep(popGqlFilter.filtered)`). Extend that local step:

```ts
const envelope = useViewportFilterEnvelope()
// ...existing local adjustments...
if (envelope) popFilter.geomPoint = { intersects: envelope }
```

- Top-level filter keys are ANDed by compile_filter, so this narrows without touching the shared tree atoms (lists/forms stay unfiltered).
- The `queryKey` already contains the filter object → react-query refetches on envelope change automatically; structural sharing keeps unchanged rows referentially stable for `useProgressiveElements`.
- Add `placeholderData: keepPreviousData` (from `@tanstack/react-query`) to each layer's `useQuery` — without it, every key change blanks the layer (all markers unmount) until the refetch lands.
- Gate with `enabled: envelope !== null` so no layer fires its (potentially 500k-row) unfiltered query during the boot window before MapPersister's first bounds write; the gate opens within one render cycle of map mount.
- Follow-up fetches (`q_tpop?id=in.(...)`, `q_pop`, `ae_taxonomies`) derive from the filtered rows — automatically scoped.
- Known trade-off (documented in code): assignment polylines filter on the beob endpoint only; a line whose beob is off-screen is culled even if its tpop is on-screen.

Untouched deliberately: the GeoJSON overlays (gemeinden 2.2k, detailplaene 691 — direct table GETs, small), and the layers-menu `apfloraLayer` query (its all-coordinates data feeds counts/zoom-to, which need global data).

## 4. Tests

- `src/components/Projekte/Karte/useViewportEnvelope.test.ts` — vitest unit tests next to the code (repo convention): padding/clamping at 50 %, containment, skip-vs-emit, polygon shape.
- `api-tests/viewport-filter.test.ts` — against the local dev PostgREST (running): mint a token, `POST /rpc/query_pop` with `p_filter` `{geomPoint: {intersects: <small polygon>}}`, assert only pops inside are returned and that a large polygon returns more rows (pattern from existing api-tests).

## 5. Verification

`npm run check` (typecheck + lint + unit). Then a manual browser pass on `npm run dev` (:5173, dev PostgREST on :3000): open a project map, pan/zoom — markers must not blank during refetch (`keepPreviousData`), new areas load after the 400 ms debounce, cluster counts update. No e2e added (Playwright suite needs credentials/backend chore; the change is covered by unit + api tests + manual pass).

## Not included

- Deploying apf2 (`npm run deploy` ships production immediately — only on your explicit request; production also needs `compileFilter.sql` applied via `apply-production-sql.sh` before/with it, else the new filter operator errors in prod).
- Electron/PWA specifics — nothing viewport-specific there.