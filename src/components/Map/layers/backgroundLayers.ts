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

export type BackgroundLayer = {
  url: string
  attribution: string
  subdomains?: string
  maxNativeZoom?: number
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
}

export const defaultBackgroundLayerId = OSM_LAYER_PRESENTATION_ID

export const backgroundLayerIds = [
  OSM_LAYER_PRESENTATION_ID,
  POSITRON_LAYER_PRESENTATION_ID,
  DARK_MATTER_LAYER_PRESENTATION_ID,
]

export const isBackgroundLayerId = (id: string) => id in backgroundLayers
