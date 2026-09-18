import { useMap, WMSTileLayer } from 'react-leaflet'
import { useDebouncedCallback } from 'use-debounce'

import type LayerPresentations from '../../../../models/public/LayerPresentations.ts'
import type WmsLayers from '../../../../models/public/WmsLayers.ts'
import { onTileError } from './onTileError.ts'

export type WmsLayerWithServiceInfo = WmsLayers & {
  type?: string | null
  wms_services_url?: string | null
  wms_services_image_format?: string | null
  wms_services_version?: string | null
  wms_services?: {
    url: string
    version: string | null
    info_format: string | null
  } | null
  opacity?: number
}

type Props = {
  layerPresentation: LayerPresentations
  layer: WmsLayerWithServiceInfo
}

export const WMS = ({ layerPresentation, layer }: Props) => {
  const map = useMap()

  const onTileErrorDebounced = useDebouncedCallback(
    onTileError.bind(this, map, layer),
    600,
  )

  // TODO:
  // leaflet calls server internally
  // BUT: if call errors, leaflet does not surface the error
  // instead ALL WMS LAYERS FAIL!!!!!!!!
  return (
    <WMSTileLayer
      url={layer.wms_services_url!}
      layers={layer.wms_service_layer_name!}
      version={layer.wms_services_version!}
      format={layer.wms_services_image_format!}
      minZoom={layerPresentation.min_zoom!}
      maxZoom={layerPresentation.max_zoom!}
      className={layerPresentation.grayscale ? 'grayscale' : ''}
      opacity={layer.opacity} // TODO: ?? seems this has been changed from layerPresentation.opacity_percent to layer.opacity
      transparent={layerPresentation.transparent === true}
      // exceptions="inimage"
      eventHandlers={{
        tileerror: onTileErrorDebounced,
      }}
    />
  )
}
