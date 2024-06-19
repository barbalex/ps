import { useCallback, useRef, useEffect, useState, FC, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
} from '@fluentui/react-components'

import { useElectric } from '../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../shared/ErrorBoundary.tsx'
import { Resize } from './Resize.tsx'

const drawerContainerStyle = {
  position: 'relative',
  display: 'flex',
}
const drawerStyle = {
  willChange: 'width',
  transitionProperty: 'width',
  transitionDuration: '16.666ms', // 60fps
}

export const Info = memo(({ redrawMap }) => {
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
      const clientX = props?.location?.current?.input?.clientX
      animationFrame.current = requestAnimationFrame(() => {
        if (isResizing && sidebarRef.current) {
          setSidebarWidth(
            sidebarRef.current.getBoundingClientRect().right - clientX,
          )
          redrawMap()
          stopResizing()
        }
      })
    },
    [isResizing, redrawMap, stopResizing],
  )

  // useEffect(() => {
  //   window.addEventListener('mouseup', stopResizing)

  //   return () => {
  //     cancelAnimationFrame(animationFrame.current)
  //     window.removeEventListener('mouseup', stopResizing)
  //   }
  // }, [resize, stopResizing])

  console.log('hello Map Info', {
    mapInfo,
    sidebarWidth,
    open: mapInfo?.length > 0,
  })

  return (
    <ErrorBoundary>
      <div style={drawerContainerStyle}>
        <Resize
          isResizing={isResizing}
          startResizing={startResizing}
          resize={resize}
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
