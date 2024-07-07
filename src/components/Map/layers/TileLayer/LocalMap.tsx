import { Rectangle } from 'react-leaflet/Rectangle'
import { Tooltip } from 'react-leaflet/Tooltip'

import { Layer_presentations as LayerPresentation } from '../../../../generated/client/index.ts'
import { ErrorBoundary } from '../../MapErrorBoundary.tsx'

interface Props {
  layerPresentation: LayerPresentation
}

export const LocalMap = ({ layerPresentation }: Props) => {
  const layer = layerPresentation.tile_layers
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
