import { useRef, useCallback } from 'react'
import 'leaflet'
import 'proj4'
import 'proj4leaflet'
import { MapContainer } from 'react-leaflet'
import { useResizeDetector } from 'react-resize-detector'
import { useLiveQuery } from 'electric-sql/react'
import 'leaflet/dist/leaflet.css'
// import 'leaflet-draw/dist/leaflet.draw.css'

import { user_id } from '../SqlInitializer'
import { Ui_options as UiOption } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TileLayers } from './TileLayers'

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
  const tileLayerSorter = uiOption?.tile_layer_sorter ?? ''
  // const vectorLayerSorter = uiOption?.vector_layer_sorter ?? ''
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

  const bounds = [
    [47.159, 8.354],
    [47.696, 8.984],
  ]
  const position = [51.505, -0.09]

  return (
    <div style={containerStyle} ref={ref}>
      <MapContainer
        className="map-container"
        style={mapContainerStyle}
        // maxZoom={22}
        // minZoom={0}
        // bounds={bounds}
        center={position}
        zoom={13}
        ref={mapRef}
        // attributionControl={false}
      >
        <TileLayers key={`${tileLayerSorter}/tileLayers`} />
      </MapContainer>
    </div>
  )
}
