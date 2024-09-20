import { TileLayer } from 'react-leaflet'

import { Wms_layers as WmsLayerType } from '../../../../generated/client/index.ts'

interface Props {
  layer: WmsLayerType
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
