import { memo } from 'react'
import { useMap, WMSTileLayer } from 'react-leaflet'
import { useDebouncedCallback } from 'use-debounce'

import { onTileError } from './onTileError.ts'
import { useElectric } from '../../../../ElectricProvider.tsx'

export const WMS = memo(({ layer }) => {
  const map = useMap()

  const { db } = useElectric()!

  const onTileErrorDebounced = useDebouncedCallback(
    onTileError.bind(this, db, map, layer),
    600,
  )

  // console.log('hello WMS', {
  //   layer,
  //   url: layer.wms_base_url,
  //   layers: layer.wms_layer?.value,
  //   version: layer.wms_version,
  //   format: layer.wms_format?.value,
  //   minZoom: layer.min_zoom,
  //   maxZoom: layer.max_zoom,
  //   className: layer.grayscale ? 'grayscale' : '',
  //   opacity: layer.opacity,
  //   transparent: layer.wms_transparent === true,
  // })

  // TODO:
  // leaflet calls server internally
  // BUT: if call errors, leaflet does not surface the error
  // instead ALL WMS LAYERS FAIL!!!!!!!!
  return (
    <WMSTileLayer
      url={layer.wms_base_url}
      layers={layer.wms_layer?.value}
      version={layer.wms_version}
      format={layer.wms_format?.value}
      minZoom={layer.min_zoom}
      maxZoom={layer.max_zoom}
      className={layer.grayscale ? 'grayscale' : ''}
      opacity={layer.opacity}
      transparent={layer.wms_transparent === true}
      // exceptions="inimage"
      eventHandlers={{
        tileerror: onTileErrorDebounced,
      }}
    />
  )
})
