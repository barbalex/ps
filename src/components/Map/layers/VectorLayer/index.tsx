import { useState } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'

import type LayerPresentations from '../../../../models/public/LayerPresentations.ts'
import type VectorLayerDisplays from '../../../../models/public/VectorLayerDisplays.ts'
import type VectorLayers from '../../../../models/public/VectorLayers.ts'
import type WfsServices from '../../../../models/public/WfsServices.ts'
import { WFS } from './WFS.tsx'
import { Upload } from './Upload.tsx'

export type VectorProps = {
  layer: VectorLayers & {
    label: string
    vector_layer_displays?: VectorLayerDisplays[] | null
    wfs_services?: Pick<
      WfsServices,
      'url' | 'version' | 'info_format' | 'default_crs'
    > | null
  }
  layerPresentation: LayerPresentations
}

export const VectorLayerChooser = (props: VectorProps) => {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  useMapEvent('zoomend', () => setZoom(map.getZoom()))
  const { min_zoom, max_zoom } = props.layerPresentation
  if (
    (min_zoom != null && zoom < min_zoom) ||
    (max_zoom != null && zoom > max_zoom)
  )
    return null

  return props.layer.type === 'upload' ?
      <Upload {...props} />
    : <WFS {...props} />
}
