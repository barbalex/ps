import { useCallback, useRef, useEffect, memo } from 'react'
import 'leaflet'
import 'proj4'
import 'proj4leaflet'
import { MapContainer } from 'react-leaflet'
import { useResizeDetector } from 'react-resize-detector'
import { useAtom } from 'jotai'

import 'leaflet/dist/leaflet.css'

import { Layers } from './layers/index.tsx'
import { LocationMarker } from './LocationMarker.tsx'
// import { tableNameFromIdField } from '../../modules/tableNameFromIdField.ts'
import { DrawControl } from './DrawControl/index.tsx'
import { BoundsListener } from './BoundsListener.tsx'
// import { Control } from './Control.tsx'
import { BottomRightControl } from './BottomRightControl/index.tsx'
import { ClickListener } from './ClickListener/index.tsx'
import { ErrorBoundary } from '../shared/ErrorBoundary.tsx'
import { InfoMarker } from './RightMenuDrawer/Marker.tsx'
import { CenterMarker } from './CenterMarker.tsx'
import { mapLocateAtom, mapInfoAtom, mapShowCenterAtom } from '../../store.ts'

const outerContainerStyle = {
  width: '100%',
  height: '100%',
  position: 'relative',
  display: 'flex',
  overflow: 'hidden',
}
const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

export const Map = memo(() => {
  const [mapShowCenter] = useAtom(mapShowCenterAtom)
  const [mapIsLocating] = useAtom(mapLocateAtom)
  const [mapInfo] = useAtom(mapInfoAtom)

  const mapRef = useRef()

  const redrawMap = useCallback(
    () => mapRef.current?.invalidateSize(),
    [mapRef],
  )

  const resizeRef = useRef<HTMLDivElement>(null)
  useResizeDetector({
    targetRef: resizeRef,
    onResize: redrawMap,
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

  // TODO: this does not seem to do anything useful
  // useEffect(() => {
  //   if (!db) return
  //   const run = async () => {
  //     await tableNameFromIdField({ idField: 'project_id', db })
  //   }
  //   run()
  // }, [db])

  // const bounds = [
  //   [47.159, 8.354],
  //   [47.696, 8.984],
  // ]
  const position = [47.4, 8.65]

  return (
    <ErrorBoundary>
      <div
        style={outerContainerStyle}
        ref={resizeRef}
        id="map"
      >
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
          <ClickListener />
          <DrawControl />
          <Layers />
          <BottomRightControl
            position="bottomright"
            visible={true}
          />
          <BoundsListener />
          {!!mapInfo?.lat && <InfoMarker mapInfo={mapInfo} />}
          {mapShowCenter && <CenterMarker />}
        </MapContainer>
      </div>
    </ErrorBoundary>
  )
})
