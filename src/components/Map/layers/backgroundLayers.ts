// Background (base) maps are pseudo layers: they have no rows in the db,
// only reserved layer_presentation ids, rendered client-side (see
// Background.tsx). They take part in the render list like every other layer
// (?layers=, mapLayerSorting atom), so the chosen background is linkable.
// Available to every account without seeding because nothing is stored.
import { OSM_LAYER_PRESENTATION_ID } from '../../../modules/useUrlLayers.ts'

export const POSITRON_LAYER_PRESENTATION_ID =
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
export const DARK_MATTER_LAYER_PRESENTATION_ID =
  'cccccccc-cccc-cccc-cccc-cccccccccccc'
export const ESRI_IMAGERY_LAYER_PRESENTATION_ID =
  'dddddddd-dddd-dddd-dddd-dddddddddddd'

// CARTO counts usage on the account and drops the "API key required"
// watermark when the key is part of the tile urls. Without it the tiles
// still serve (watermarked). Keys are issued per allowed referer, so the
// key for the production origin and the one for localhost dev are separate:
// VITE_CARTO_BASEMAPS_KEY (promote-species.app, Netlify env) and
// VITE_CARTO_BASEMAPS_KEY_LOCALHOST (root .env for dev).
const isLocalhost = ['localhost', '127.0.0.1'].includes(
  window.location.hostname,
)
const cartoKey = isLocalhost ?
  import.meta.env.VITE_CARTO_BASEMAPS_KEY_LOCALHOST
: import.meta.env.VITE_CARTO_BASEMAPS_KEY
const cartoUrl = (style: string) =>
  `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png${cartoKey ? `?key=${cartoKey}` : ''}`
const esriKey = (isLocalhost ?
  import.meta.env.VITE_ESRI_BASEMAPS_KEY_LOCALHOST
: import.meta.env.VITE_ESRI_BASEMAPS_KEY)?.trim()

export type BackgroundLayer = {
  url: string
  attribution: string
  subdomains?: string
  maxNativeZoom?: number
  maxZoom?: number
}

// Positron and Dark Matter: CARTO's raster renders of the styles shown on
// https://openmaptiles.org/styles/positron/ and .../dark-matter/ (openmaptiles
// itself hosts them as vector tiles, which would need an api key and a
// vector-tile plugin). {r} expands to @2x on retina displays.
export const backgroundLayers: Record<string, BackgroundLayer> = {
  [OSM_LAYER_PRESENTATION_ID]: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="//osm.org/copyright">OpenStreetMap</a>',
  },
  [POSITRON_LAYER_PRESENTATION_ID]: {
    url: cartoUrl('light_all'),
    subdomains: 'abcd',
    maxNativeZoom: 20,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  [DARK_MATTER_LAYER_PRESENTATION_ID]: {
    url: cartoUrl('dark_all'),
    subdomains: 'abcd',
    maxNativeZoom: 20,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  ...(esriKey && {
    [ESRI_IMAGERY_LAYER_PRESENTATION_ID]: {
      // ArcGIS map tiles use level/row/column, not XYZ order.
      url: `https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=${encodeURIComponent(esriKey)}`,
      maxZoom: 23,
      attribution:
        '<a href="https://www.esri.com/">Powered by Esri</a> | Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community',
    },
  }),
}

export const defaultBackgroundLayerId = OSM_LAYER_PRESENTATION_ID

export const backgroundLayerIds = Object.keys(backgroundLayers)

// A shared link or saved selection may come from a build with an Esri key.
export const availableBackgroundId = (id: string) =>
  id === ESRI_IMAGERY_LAYER_PRESENTATION_ID && !esriKey ? defaultBackgroundLayerId : id

export const isBackgroundLayerId = (id: string) =>
  Object.hasOwn(backgroundLayers, availableBackgroundId(id))
