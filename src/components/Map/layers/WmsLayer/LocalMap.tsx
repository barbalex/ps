import * as L from 'leaflet'
import { Rectangle } from 'react-leaflet/Rectangle'
import { Tooltip } from 'react-leaflet/Tooltip'

import type LayerPresentations from '../../../../models/public/LayerPresentations.ts'
import type WmsLayers from '../../../../models/public/WmsLayers.ts'
import { ErrorBoundary } from '../../MapErrorBoundary.tsx'

type Props = {
  layerPresentation: LayerPresentations & {
    wms_layers?: WmsLayers | null
  }
}

export const LocalMap = ({ layerPresentation }: Props) => {
  const layer = layerPresentation.wms_layers!
  const bounds = ((layer.local_data_bounds ?? []) as {
    _southWest: L.LatLngLiteral
    _northEast: L.LatLngLiteral
  }[]).map((b) => L.latLngBounds(b._southWest, b._northEast))

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
