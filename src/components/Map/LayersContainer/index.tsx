import { useCallback, useRef, memo, useState, useEffect, useMemo } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { InlineDrawer, Button } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { BiSolidLeftArrow, BiSolidRightArrow } from 'react-icons/bi'

import { Layers } from './Layers/index.tsx'
import { Resizer } from './Resizer.tsx'
import { useElectric } from '../../../ElectricProvider.tsx'

import './index.css'

const containerStyle = {
  position: 'absolute',
  display: 'flex',
  zIndex: 10000,
  maxWidth: '100%',
  // without this when widening the window the sidebar's bottom will show the map behind it
  backgroundColor: 'white',
}

export const LayersContainer = memo(({ containerRef }) => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const mapHideUi = appState?.map_hide_ui

  const { width: containerWidth } = useResizeDetector({
    targetRef: containerRef,
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 100,
    refreshOptions: { leading: false, trailing: true },
  })
  const isNarrow = containerWidth < 700

  const { width: ownWidth, ref: widthRef } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 100,
    refreshOptions: { leading: false, trailing: true },
  })
  const [sidebarSize, setSidebarSize] = useState(isNarrow ? 500 : 320)
  // when width falls below 35, set sidebarSize to 5
  useEffect(() => {
    if (!mapHideUi && ownWidth < 40) setSidebarSize(5)
  }, [mapHideUi, ownWidth])

  const isOpen = useMemo(() => sidebarSize > 35, [sidebarSize])
  const toggleOpen = useCallback(
    (e) => {
      e.stopPropagation()
      setSidebarSize(isOpen ? 5 : isNarrow ? 500 : 320)
    },
    [isNarrow, isOpen],
  )

  const animationFrame = useRef<number>(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)

  const startResizing = useCallback(() => setIsResizing(true), [])
  const stopResizing = useCallback(() => setIsResizing(false), [])

  const resize = useCallback(
    ({ clientX, clientY }) => {
      if (!isResizing) return
      if (!sidebarRef.current) return

      const newSidebarSize = isNarrow
        ? window.innerHeight - clientY
        : clientX - sidebarRef.current.getBoundingClientRect().left

      animationFrame.current = requestAnimationFrame(() =>
        setSidebarSize(newSidebarSize),
      )
    },
    [isNarrow, isResizing],
  )

  useEffect(() => {
    window.addEventListener('mousemove', resize)
    // these events cant be added to the resizer's events
    // because on dragging the mouse immediately leaves the resizer
    window.addEventListener('mouseup', stopResizing)
    window.addEventListener('mouseleave', stopResizing)

    return () => {
      cancelAnimationFrame(animationFrame.current)
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
      window.removeEventListener('mouseleave', stopResizing)
    }
  }, [resize, stopResizing])

  return (
    <div
      className="map-layers-container"
      style={{
        ...containerStyle,
        // dragging can mark text so we disable pointer events
        ...(isResizing ? { pointerEvents: 'none' } : {}),
      }}
      ref={widthRef}
    >
      {!mapHideUi && (
        <Button
          onClick={toggleOpen}
          icon={isOpen ? <BiSolidLeftArrow /> : <BiSolidRightArrow />}
          title={isOpen ? 'Close Layers' : 'Open Layers'}
          style={{
            position: 'absolute',
            top: isNarrow ? (isOpen ? 11 : -26) : 5,
            right: isNarrow ? 'unset' : isOpen ? 5.5 : -26.5,
            left: isNarrow ? 5 : 'unset',
            marginRight: isOpen ? 5 : 0,
            zIndex: 100000000,
            borderTopLeftRadius: isNarrow ? (isOpen ? 0 : 4) : isOpen ? 4 : 0,
            borderBottomLeftRadius: isNarrow
              ? isOpen
                ? 4
                : 0
              : isOpen
              ? 4
              : 0,
            borderTopRightRadius: isNarrow ? (isOpen ? 0 : 4) : isOpen ? 0 : 4,
            borderBottomRightRadius: isNarrow
              ? isOpen
                ? 4
                : 0
              : isOpen
              ? 0
              : 4,
          }}
        />
      )}
      <InlineDrawer
        open={!mapHideUi}
        ref={sidebarRef}
        className="map-layers-drawer"
        style={{
          ...(isNarrow ? { height: sidebarSize } : { width: sidebarSize }),
        }}
        position={isNarrow ? 'bottom' : 'start'}
        onMouseDown={(e) => e.preventDefault()}
      >
        <Layers isNarrow={isNarrow} />
        <Resizer startResizing={startResizing} isResizing={isResizing} />
      </InlineDrawer>
    </div>
  )
})