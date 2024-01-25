import { useRef, useCallback } from 'react'
import 'leaflet'
import 'proj4'
import 'proj4leaflet'
import { MapContainer } from 'react-leaflet'
import { useResizeDetector } from 'react-resize-detector'
import { useLiveQuery } from 'electric-sql/react'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

import { user_id } from '../SqlInitializer'
import { UiOptions as UiOption } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'

const containerStyle = {
  width: '100%',
  height: '100%',
}
const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

export const Map = () => {
  const mapRef = useRef()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const uiOption: UiOption = results
  const showMap = uiOption?.show_map ?? true
  console.log('Map', { uiOption, showMap })

  const onResize = useCallback(() => {
    if (!showMap) return
    mapRef.current?.leafletElement?.invalidateSize()
  }, [showMap])
  const { ref } = useResizeDetector({
    onResize,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { trailing: true },
  })

  return (
    <div style={containerStyle} ref={ref}>
      <MapContainer
        className="map-container"
        style={mapContainerStyle}
        maxZoom={22}
        minZoom={0}
        // bounds={bounds}
        ref={mapRef}
        attributionControl={false}
      />
    </div>
  )
}
