import { TileLayer } from 'react-leaflet'

export const WMTS = ({ layer }) => {
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
