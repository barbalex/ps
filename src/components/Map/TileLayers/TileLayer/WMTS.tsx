import { TileLayer } from 'react-leaflet'

import { TileLayer as TileLayerType } from '../../../../dexieClient'

type Props = {
  layer: TileLayerType
}

const WMTS = ({ layer }: Props) => {
  return (
    <TileLayer
      url={layer.wmts_url_template}
      maxNativeZoom={19}
      minZoom={layer.min_zoom}
      maxZoom={layer.max_zoom}
      opacity={layer.opacity}
    />
  )
}

export default WMTS
