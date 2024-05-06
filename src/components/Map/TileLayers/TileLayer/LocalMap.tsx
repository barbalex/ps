import { Rectangle } from 'react-leaflet/Rectangle'
import { Tooltip } from 'react-leaflet/Tooltip'

import { Tile_layers as TileLayer } from '../../../../generated/client/index.ts'
import { ErrorBoundary } from '../../MapErrorBoundary.tsx'

interface Props {
  layer: TileLayer
}

export const LocalMap = ({ layer }: Props) => {
  const bounds = (layer.local_data_bounds ?? []).map((b) =>
    L.latLngBounds(b._southWest, b._northEast),
  )

  return (
    <ErrorBoundary layer={layer}>
      {bounds.map((b, index) => (
        <Rectangle key={index} bounds={b}>
          <Tooltip>{layer.label}</Tooltip>
        </Rectangle>
      ))}
    </ErrorBoundary>
  )
}
