import { useCallback, useRef, useEffect } from 'react'
import 'leaflet'
import 'proj4'
import 'proj4leaflet'
import { MapContainer } from 'react-leaflet'
import { useResizeDetector } from 'react-resize-detector'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbadoSession } from '@corbado/react'

import 'leaflet/dist/leaflet.css'
// import 'leaflet-draw/dist/leaflet.draw.css'

import { App_states as AppState } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TileLayers } from './TileLayers'
import { VectorLayers } from './VectorLayers'
import { LocationMarker } from './LocationMarker'
import { tableNameFromIdField } from '../../modules/tableNameFromIdField'
import { DrawControl } from './DrawControl'
import { TableLayers } from './TableLayers'
import { BoundsListener } from './BoundsListener'
// import { Control } from './Control'
// import { OwnControls } from './OwnControls'
import { ErrorBoundary } from '../shared/ErrorBoundary'

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

export const Map = () => {
  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const appState: AppState = results
  const showMap = appState?.show_map ?? true
  const tileLayerSorter = appState?.tile_layer_sorter ?? ''
  const vectorLayerSorter = appState?.vector_layer_sorter ?? ''

  const mapRef = useRef()

  const onResize = useCallback(() => {
    if (!showMap) return
    // console.log('hello Map.onResize')
    mapRef.current?.invalidateSize()
  }, [mapRef, showMap])
  const { ref: resizeRef } = useResizeDetector({
    onResize,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { trailing: true },
  })

  // Issue: map is not drawn correctly on first render
  // Solution: invalidateSize() after first render
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current?.invalidateSize()
  }, [mapRef, mapRef.current?.invalidateSize])

  useEffect(() => {
    if (!db) return
    const run = async () => {
      await tableNameFromIdField({ idField: 'project_id', db })
    }
    run()
  }, [db])

  // const bounds = [
  //   [47.159, 8.354],
  //   [47.696, 8.984],
  // ]
  const position = [47.4, 8.65]

  // console.log('hello Map, mapRef:', mapRef)

  return (
    <ErrorBoundary>
      <div style={mapContainerStyle} ref={resizeRef}>
        <MapContainer
          className="map-container"
          style={mapContainerStyle}
          // maxZoom={22}
          // minZoom={0}
          // bounds={bounds}
          center={position}
          zoom={13}
          ref={mapRef}
        >
          <LocationMarker />
          <DrawControl />
          <TileLayers key={`${tileLayerSorter}/tileLayers`} />
          <TableLayers />
          <VectorLayers key={`${vectorLayerSorter}/vectorLayers`} />
          {/* <Control position="topright" visible={true}>
          <OwnControls />
        </Control> */}
          <BoundsListener />
        </MapContainer>
      </div>
    </ErrorBoundary>
  )
}
