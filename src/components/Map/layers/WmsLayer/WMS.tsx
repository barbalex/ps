import { useDebouncedCallback } from 'use-debounce'

import type LayerPresentations from '../../../../models/public/LayerPresentations.ts'
import type WmsLayers from '../../../../models/public/WmsLayers.ts'
import { WMSTileLayer } from './WMSTileLayer.tsx'
import { onTileError } from './onTileError.ts'

export type WmsLayerWithServiceInfo = WmsLayers & {
  type?: string | null
  wms_services_url?: string | null
  wms_services_image_format?: string | null
  wms_services_version?: string | null
  opacity?: number
}

type Props = {
  layerPresentation: LayerPresentations
  layer: WmsLayerWithServiceInfo
}

export const WMS = ({ layerPresentation, layer }: Props) => {
  const onTileErrorDebounced = useDebouncedCallback(onTileError, 600)

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
        tileerror: ({ tile }) => {
          if (!(tile instanceof HTMLImageElement) || !tile.isConnected) return
          // Leaflet clears src when cancelling tiles that left the viewport.
          const url = tile.getAttribute('src')
          if (!url) return
          if (!tile.dataset.wmsRetried) {
            tile.dataset.wmsRetried = 'true'
            tile.src = url
            return
          }
          onTileErrorDebounced(
            tile.src,
            layer.label ?? layer.wms_service_layer_name ?? 'WMS',
          )
        },
      }}
    />
  )
}
