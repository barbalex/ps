import { useRef, useMemo } from 'react'
import 'leaflet'
import 'proj4'
import 'proj4leaflet'
import { MapContainer } from 'react-leaflet'
import { useResizeDetector } from 'react-resize-detector'
import { useAtomValue } from 'jotai'

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
import {
  mapLocateAtom,
  mapInfoAtom,
  mapShowCenterAtom,
} from '../../store.ts'
import styles from './Map.module.css'

const DEFAULT_CENTER = [47.4, 8.65]
const DEFAULT_ZOOM = 13

export const Map = () => {
  const mapShowCenter = useAtomValue(mapShowCenterAtom)
  const mapIsLocating = useAtomValue(mapLocateAtom)
  const mapInfo = useAtomValue(mapInfoAtom)

  // Read initial map state directly from localStorage
  const initialCenter = useMemo(() => {
    try {
      const stored = localStorage.getItem('mapCenter')
      if (stored) {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) && parsed.length === 2 ? parsed : DEFAULT_CENTER
      }
    } catch (e) {
      console.error('Failed to parse mapCenter from localStorage:', e)
    }
    return DEFAULT_CENTER
  }, [])

  const initialZoom = useMemo(() => {
    try {
      const stored = localStorage.getItem('mapZoom')
      if (stored) {
        const parsed = JSON.parse(stored)
        return typeof parsed === 'number' ? parsed : DEFAULT_ZOOM
      }
    } catch (e) {
      console.error('Failed to parse mapZoom from localStorage:', e)
    }
    return DEFAULT_ZOOM
  }, [])

  const mapRef = useRef()

  const redrawMap = () => mapRef.current?.invalidateSize()

  // Issue: map is not drawn correctly on first render
  // Solution: invalidateSize() after first render
  const resizeRef = useRef<HTMLDivElement>(null)
  useResizeDetector({
    targetRef: resizeRef,
    onResize: redrawMap,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { trailing: true },
  })

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

  return (
    <ErrorBoundary>
      <div className={styles.outerContainer} ref={resizeRef} id="map">
        <MapContainer
          zoomControl={false}
          className={`${styles.mapContainer} map-container`}
          // maxZoom={22}
          // minZoom={0}
          // bounds={bounds}
          center={initialCenter}
          zoom={initialZoom}
          ref={mapRef}
        >
          {mapIsLocating && <LocationMarker />}
          <ClickListener />
          <DrawControl />
          <Layers />
          <BottomRightControl position="bottomright" visible={true} />
          <BoundsListener />
          {!!mapInfo?.lat && <InfoMarker mapInfo={mapInfo} />}
          {mapShowCenter && <CenterMarker />}
        </MapContainer>
      </div>
    </ErrorBoundary>
  )
}
