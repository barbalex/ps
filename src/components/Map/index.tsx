import { useCallback, useRef, useEffect, useState, FC } from 'react'
import 'leaflet'
import 'proj4'
import 'proj4leaflet'
import { MapContainer } from 'react-leaflet'
import { useResizeDetector } from 'react-resize-detector'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
} from '@fluentui/react-components'

import 'leaflet/dist/leaflet.css'

import { css } from '../../css.ts'
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
import { ClickListener } from './ClickListener/index.tsx'
import { ErrorBoundary } from '../shared/ErrorBoundary.tsx'

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  position: 'relative',
  display: 'flex',
}
const drawerStyle = {
  willChange: 'width',
  transitionProperty: 'width',
  transitionDuration: '16.666ms', // 60fps
}
const resizerStyle = {
  borderRight: `1px solid black`,
  width: '8px',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  cursor: 'col-resize',
  resize: 'horizontal',
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
  const mapInfo = appState?.map_info

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

  const animationFrame = useRef<number>(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)

  const startResizing = useCallback(() => setIsResizing(true), [])
  const stopResizing = useCallback(() => setIsResizing(false), [])

  const resize = useCallback(
    ({ clientX }) => {
      animationFrame.current = requestAnimationFrame(() => {
        if (isResizing && sidebarRef.current) {
          setSidebarWidth(
            clientX - sidebarRef.current.getBoundingClientRect().left,
          )
        }
      })
    },
    [isResizing],
  )

  const ResizeComponent: FC = () => (
    <div
      style={css({
        ...resizerStyle,
        on: ($) => [$('&:hover', { borderRightWidth: 4 })],
      })}
      onMouseDown={startResizing}
    />
  )

  useEffect(() => {
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', stopResizing)

    return () => {
      cancelAnimationFrame(animationFrame.current)
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [resize, stopResizing])

  console.log('hello Map', { mapInfo, sidebarWidth, open: mapInfo?.length > 0 })

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
          <ClickListener />
          <DrawControl />
          <TileLayers key={`${tileLayerSorter}/tileLayers`} />
          <TableLayers />
          <VectorLayers key={`${vectorLayerSorter}/vectorLayers`} />
          <BottomRightControl position="bottomright" visible={true} />
          <BoundsListener />
        </MapContainer>
        <InlineDrawer
          open={mapInfo?.length > 0}
          ref={sidebarRef}
          style={{ width: sidebarWidth, ...drawerStyle }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <DrawerHeader>
            <DrawerHeaderTitle>Default Drawer</DrawerHeaderTitle>
          </DrawerHeader>
          <DrawerBody>
            <p>Resizable content</p>
          </DrawerBody>
        </InlineDrawer>
        <ResizeComponent />
      </div>
    </ErrorBoundary>
  )
}
