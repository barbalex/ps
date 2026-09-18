import { TileLayer } from 'react-leaflet'

type Props = {
  layer: {
    wmts_url_template: string
    opacity?: number
    layer_presentations?:
      | {
          min_zoom?: number
          max_zoom?: number
        }[]
      | null
  }
}

export const WMTS = ({ layer }: Props) => {
  return (
    <TileLayer
      url={layer.wmts_url_template}
      maxNativeZoom={19}
      minZoom={layer?.layer_presentations?.[0]?.min_zoom}
      maxZoom={layer?.layer_presentations?.[0]?.max_zoom}
      opacity={layer.opacity}
    />
  )
}
