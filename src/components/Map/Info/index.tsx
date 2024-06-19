import { useCallback, useRef, useEffect, useState, FC, memo } from 'react'
import 'leaflet'
import 'proj4'
import 'proj4leaflet'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
} from '@fluentui/react-components'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

import 'leaflet/dist/leaflet.css'

import { css } from '../../../css.ts'
import { useElectric } from '../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../shared/ErrorBoundary.tsx'

const drawerContainerStyle = {
  position: 'relative',
  display: 'flex',
}
const drawerStyle = {
  willChange: 'width',
  transitionProperty: 'width',
  transitionDuration: '16.666ms', // 60fps
}
const resizerStyle = {
  borderLeftWidth: '1px',
  borderLeft: 'solid',
  borderLeftColor: 'grey',
  width: '8px',
  position: 'relative',
  // top: 0,
  left: 0,
  // bottom: 0,
  cursor: 'col-resize',
  resize: 'horizontal',
  zIndex: 1,
}

const ResizeComponent: FC = memo(({ isResizing, startResizing }) => (
  <div
    style={css({
      ...resizerStyle,
      ...(isResizing
        ? {
            borderLeftWidth: 4,
            borderLeftColor: 'black',
          }
        : {}),
      on: ($) => [$('&:hover', { borderLeftWidth: 4 })],
    })}
    onMouseDown={startResizing} // TODO: works but slow. Better to resize on dragend?
    onMouseUp={() => console.log('mouse up, resize now?')}
    onDragEnd={() => console.log('drag end, resize now?')}
  />
))

export const Info = memo(() => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const mapInfo = appState?.map_info

  const animationFrame = useRef<number>(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)

  const startResizing = useCallback(() => setIsResizing(true), [])
  const stopResizing = useCallback(() => setIsResizing(false), [])

  const resize = useCallback(
    (props) => {
      const { clientX } = props
      animationFrame.current = requestAnimationFrame(() => {
        if (isResizing && sidebarRef.current) {
          setSidebarWidth(
            sidebarRef.current.getBoundingClientRect().right - clientX,
          )
        }
      })
    },
    [isResizing],
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

  console.log('hello Map Info', {
    mapInfo,
    sidebarWidth,
    open: mapInfo?.length > 0,
  })

  return (
    <ErrorBoundary>
      <div style={drawerContainerStyle}>
        <ResizeComponent
          isResizing={isResizing}
          startResizing={startResizing}
        />
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
      </div>
    </ErrorBoundary>
  )
})
