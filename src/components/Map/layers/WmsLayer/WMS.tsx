import { memo } from 'react'
import { useMap, WMSTileLayer } from 'react-leaflet'
import { useDebouncedCallback } from 'use-debounce'

import { onTileError } from './onTileError.ts'
import { useElectric } from '../../../../ElectricProvider.tsx'
import { Layer_presentations as LayerPresentation } from '../../../../generated/client/index.ts'

type Props = {
  layerPresentation: LayerPresentation
}

export const WMS = memo(({ layerPresentation }: Props) => {
  const map = useMap()

  const { db } = useElectric()!

  const layer = layerPresentation.wms_layers

  const onTileErrorDebounced = useDebouncedCallback(
    onTileError.bind(this, db, map, layer),
    600,
  )

  // TODO:
  // leaflet calls server internally
  // BUT: if call errors, leaflet does not surface the error
  // instead ALL WMS LAYERS FAIL!!!!!!!!
  return (
    <WMSTileLayer
      url={layer.wms_services.url}
      layers={layer.wms_service_layer_name}
      version={layer.wms_services.version}
      format={layer.wms_services.image_format}
      minZoom={layer.min_zoom}
      maxZoom={layer.max_zoom}
      className={layerPresentation.grayscale ? 'grayscale' : ''}
      opacity={layer.opacity} // TODO: ?? seems this has been changed from layerPresentation.opacity_percent to layer.opacity
      transparent={layerPresentation.transparent === true}
      // exceptions="inimage"
      eventHandlers={{
        tileerror: onTileErrorDebounced,
      }}
    />
  )
})
