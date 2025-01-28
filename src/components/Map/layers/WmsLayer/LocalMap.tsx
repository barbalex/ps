import { Rectangle } from 'react-leaflet/Rectangle'
import { Tooltip } from 'react-leaflet/Tooltip'

import { ErrorBoundary } from '../../MapErrorBoundary.tsx'

export const LocalMap = ({ layerPresentation }) => {
  const layer = layerPresentation.wms_layers
  const bounds = (layer.local_data_bounds ?? []).map((b) =>
    L.latLngBounds(b._southWest, b._northEast),
  )

  return (
    <ErrorBoundary layer={layer}>
      {bounds.map((b, index) => (
        <Rectangle
          key={index}
          bounds={b}
        >
          <Tooltip>{layer.label}</Tooltip>
        </Rectangle>
      ))}
    </ErrorBoundary>
  )
}
