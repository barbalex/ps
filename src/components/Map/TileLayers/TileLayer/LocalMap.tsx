import { Rectangle } from 'react-leaflet/Rectangle'
import { Tooltip } from 'react-leaflet/Tooltip'

import { TileLayer } from '../../../../dexieClient'
import MapErrorBoundary from '../../../shared/MapErrorBoundary'

type Props = {
  layer: TileLayer
}

const LocalMapComponent = ({ layer }: Props) => {
  const bounds = (layer.local_data_bounds ?? []).map((b) =>
    L.latLngBounds(b._southWest, b._northEast),
  )

  return (
    <MapErrorBoundary layer={layer}>
      {bounds.map((b, index) => (
        <Rectangle key={index} bounds={b}>
          <Tooltip>{layer.label}</Tooltip>
        </Rectangle>
      ))}
    </MapErrorBoundary>
  )
}

export default LocalMapComponent
