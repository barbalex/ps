import { TileLayer } from 'react-leaflet'

import type TileLayers from '../../../models/public/TileLayers.ts'

// Row of a tile_layers query joined with its layer_presentation columns
export type TileLayerRow = TileLayers & {
  layer_presentation_id: string
  active: boolean
  opacity_percent: number | null
  grayscale: boolean | null
  max_zoom: number | null
  min_zoom: number | null
}

type Props = {
  tileLayer: TileLayerRow
  opacity?: number
}

export const TilesLayer = ({ tileLayer, opacity = 1 }: Props) => (
  <TileLayer
    url={tileLayer.url_template ?? ''}
    attribution={tileLayer.attribution ?? ''}
    // only forward the optional fields when set: passing subdomains={undefined}
    // overwrites leaflet's 'abc' default and crashes tile urls ({s} has no value)
    {...(tileLayer.subdomains ?
      { subdomains: tileLayer.subdomains as string[] }
    : {})}
    {...(tileLayer.max_native_zoom ?
      { maxNativeZoom: tileLayer.max_native_zoom }
    : {})}
    minZoom={tileLayer.min_zoom ?? 0}
    maxZoom={tileLayer.max_zoom ?? 19}
    className={tileLayer.grayscale ? 'grayscale' : ''}
    opacity={opacity}
  />
)
