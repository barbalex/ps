import { useCallback, useRef, useEffect } from 'react'
import 'leaflet'
import 'proj4'
import 'proj4leaflet'
import { MapContainer } from 'react-leaflet'
import { useResizeDetector } from 'react-resize-detector'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import 'leaflet/dist/leaflet.css'
// import 'leaflet-draw/dist/leaflet.draw.css'

import { useElectric } from '../../ElectricProvider.tsx'
import { TileLayers } from './TileLayers/index.tsx'
import { VectorLayers } from './VectorLayers/index.tsx'
import { LocationMarker } from './LocationMarker.tsx'
import { tableNameFromIdField } from '../../modules/tableNameFromIdField.ts'
import { DrawControl } from './DrawControl/index.tsx'
import { TableLayers } from './TableLayers/index.tsx'
import { BoundsListener } from './BoundsListener.tsx'
// import { Control } from './Control.tsx'
import { BottomRightControl } from './BottomRightControl/index.tsx'
// import { OwnControls } from './OwnControls'
import { ErrorBoundary } from '../shared/ErrorBoundary.tsx'
import { ScaleControl } from './ScaleControlOrig/index.tsx'

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

export const Map = () => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const tileLayerSorter = appState?.tile_layer_sorter ?? ''
  const vectorLayerSorter = appState?.vector_layer_sorter ?? ''
  const mapIsLocating = appState?.map_locate ?? false

  const mapRef = useRef()

  const onResize = useCallback(() => mapRef.current?.invalidateSize(), [mapRef])
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
      <div style={mapContainerStyle} ref={resizeRef} id="map">
        <MapContainer
          className="map-container"
          zoomControl={false}
          style={mapContainerStyle}
          // maxZoom={22}
          // minZoom={0}
          // bounds={bounds}
          center={position}
          zoom={13}
          ref={mapRef}
        >
          {mapIsLocating && <LocationMarker />}
          <DrawControl />
          <TileLayers key={`${tileLayerSorter}/tileLayers`} />
          <TableLayers />
          <VectorLayers key={`${vectorLayerSorter}/vectorLayers`} />
          <BottomRightControl position="bottomright" visible={true} />
          <BoundsListener />
        </MapContainer>
      </div>
    </ErrorBoundary>
  )
}
