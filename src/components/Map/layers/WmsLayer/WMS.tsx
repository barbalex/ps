import { memo } from 'react'
import { useMap, WMSTileLayer } from 'react-leaflet'
import { useDebouncedCallback } from 'use-debounce'
import { usePGlite } from '@electric-sql/pglite-react'

import { onTileError } from './onTileError.ts'

export const WMS = memo(({ layerPresentation, layer }) => {
  const map = useMap()
  const db = usePGlite()

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
      url={layer.wms_services_url}
      layers={layer.wms_service_layer_name}
      version={layer.wms_services_version}
      format={layer.wms_services_image_format}
      minZoom={layerPresentation.min_zoom}
      maxZoom={layerPresentation.max_zoom}
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
