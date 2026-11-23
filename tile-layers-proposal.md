# Proposal: project owners add their own base tile layers

Status: proposal, not yet implemented. The hardcoded background maps (OSM /
Positron / Dark Matter, `src/components/Map/layers/backgroundLayers.ts`) ship
separately and stay as they are.

## Goal

Project owners can add their own raster **XYZ tile layers** the same way they
add WMS/WFS today: configured per project, shown in the map's layer drawer,
activatable/deactivatable like any other layer. The motivating use cases:

- **Fiord Color** (openmaptiles style, skipped from the hardcoded set because
  it needs a MapTiler API key):
  `https://api.maptiler.com/maps/fiord/{z}/{x}/{y}@2x.png?key=<KEY>`
- **Swisstopo WMTS in EPSG:3857** (Pixelkarte farbe, Luftbild):
  `https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg`
- any other XYZ provider (OpenTopoMap, Stadia, own GeoServer/MapProxy, …).

Not WMS: these servers hand out pre-rendered tiles by z/x/y instead of
answering GetMap requests — so they don't fit the existing
`wms_services`/capabilities machinery, only the layer/presentation part.

## What already exists and anticipates this

- Schema TODO on `wms_layers` (`backend/db/init/04_createTables.sql`):
  `-- TODO: create table for wmts / wmts_url_template / wmts_subdomains`
- Client stub `src/components/Map/layers/WmsLayer/WMTS.tsx` (renders a plain
  Leaflet `TileLayer` from `wmts_url_template`) and the `type` field on
  `WmsLayerWithServiceInfo`; `WmsLayerComponent` already branches on
  `layer.type === 'wmts'`.
- `layer_presentations` is layer-type agnostic (active flag, opacity,
  transparent, grayscale, min/max zoom) and works for whatever layer a
  presentation points at.
- `wms_layers` syncs whole rows to every user of the project
  (`backend-dev/auth/shapeDefinitions.mjs` — no column filter, so **new
  columns sync without touching the shape**).
- Writes on `wms_layers` are guarded by `enforce_project_write()`
  (`12_writePermissionTriggers.sql`) — writer or higher role required.
- Config UI pattern per entity: `src/routes/data/projects/$projectId_/wms-services/…`,
  `wms-layers/…` plus forms in `src/formsAndLists/`.

## Options

### Option A (recommended): a `tiles` type on `wms_layers`

```sql
CREATE TYPE wms_layer_types_enum AS ENUM ('wms', 'tiles');
-- on wms_layers:
type           wms_layer_types_enum DEFAULT 'wms',
url_template   text DEFAULT NULL,   -- e.g. https://…/{z}/{x}/{y}{r}.png?key=…
subdomains     jsonb DEFAULT NULL,  -- ["a","b","c","d"], optional
max_native_zoom integer DEFAULT NULL,
attribution    text DEFAULT NULL,   -- optional, appended in the map
```

- A `tiles` layer needs **no** `wms_services` row (`wms_service_id` stays
  null) and no capabilities fetch.
- Renderer: `Layer.tsx` currently INNER JOINs `wms_services` — becomes a LEFT
  JOIN; `type = 'tiles'` renders a thin `TileLayer` component
  (`{z}/{x}/{y}`, `{r}` retina, `{s}` + subdomains, `maxNativeZoom`,
  attribution), `type = 'wms'` unchanged.
- Drawer: the WMS section's add button gets a sibling "Add tile layer"
  (url template, label, optional subdomains/max zoom/attribution). No new
  table, no new shape, no new permission path.
- Cons: `wms_layers` stops meaning "WMS only" (name and comments need a
  touch-up); the join change needs care so WMS rendering keeps requiring the
  service row.

### Option B: dedicated `tile_layers` table

`tile_layers(tile_layer_id, project_id, label, url_template, subdomains,
max_native_zoom, attribution, audit columns)` + a `tile_layer_id` FK on
`layer_presentations`.

- Pros: clean naming and semantics; nothing about WMS changes.
- Cons: one more table + sync shape + route/form/drawer-section. More surface
  than A for the same end result.

### Option C (follow-up to A or B): feed the background chooser

A flag `is_background boolean` on the tile layer rows would list them in the
drawer's "Hintergrundkarte" section as additional radio options next to
OSM/Positron/Dark Matter. The swap mechanism already replaces *whichever*
background id sits in the render list, so real layer_presentation ids work
there too. Can be added later without touching the renderer; until then tile
layers simply stack as normal layers.

## Renderer / product notes (both options)

- **API keys** live inside the url template (`?key=…`) and are therefore
  public in the client. That is MapTiler's intended usage model (restrict by
  domain on paid tiers); CARTO works keyless; swisstopo needs none. Worth a
  hint text in the form.
- **CRS**: Leaflet renders EPSG:3857 only. Swisstopo works via its 3857
  tilematrixset; LV95/WMTS (EPSG:2056, `proj4leaflet`) stays out of scope for
  v1 (that's a WMTS-options question, not a tile-template one).
- **`maxNativeZoom`** per layer to avoid blank tiles past the provider's
  limit (Leaflet over-zooms instead).
- **Attribution/licensing**: optional per-layer attribution string;
  providers require crediting (CARTO/MapTiler/OSM).
- **Offline**: not in v1 — no local tile cache (the WMS `local_data_*`
  mechanism doesn't transfer to z/x/y tiles; revisit if needed).

## Recommendation

**Option A**, with Option C as a cheap follow-up if owners' tile maps should
compete with the hardcoded backgrounds. Rationale: sync, permissions,
presentations, drawer plumbing and even a renderer stub already exist and
anticipate it; the production DB is rebuilt from scratch rather than migrated
(dev-documentation.md §15), so there's no migration cost; existing projects
need no backfill because the feature is opt-in per project.

## Effort sketch (Option A)

1. `backend/db/init/04_createTables.sql`: enum + 4 columns, comments; `npm run sync-sql`; `npm run models:generate`
2. `Layer.tsx`: LEFT JOIN `wms_services`; render `TilesLayer` for `type = 'tiles'` (reuses `Background.tsx`'s shape)
3. Drawer: "Add tile layer" button + a small form (label, url template, subdomains, max zoom, attribution); reuse `createWmsLayer` pattern in `modules/createRows.ts`
4. e2e: add a tile layer via drawer, activate it, assert its tiles render
5. `npm run verify` + e2e against the dev stack

Roughly half a day including verification.
