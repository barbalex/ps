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

  const {
    width: ownWidth,
    height: ownHeight,
    ref: widthRef,
  } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 100,
    refreshOptions: { leading: false, trailing: true },
  })
  const [size, setSize] = useState(isNarrow ? 500 : 380)
  // when width falls below 40, set sidebarSize to 5
  useEffect(() => {
    if ((isNarrow && ownHeight <= 40) || (!isNarrow && ownWidth <= 40)) {
      setSize(5)
    }
  }, [isNarrow, ownHeight, ownWidth])

  const isOpen = useMemo(() => size > 40, [size])
  const toggleOpen = useCallback(
    (e) => {
      e.stopPropagation()
      console.log('toggling open')
      // TODO: animate the change from open to close and versa
      setSize(isOpen ? 5 : isNarrow ? 500 : 380)
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
        setSize(newSidebarSize),
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
          icon={
            isOpen ? (
              <BiSolidLeftArrow
                style={{ transform: isNarrow ? 'rotate(270deg)' : 'unset' }}
              />
            ) : (
              <BiSolidRightArrow
                style={{ transform: isNarrow ? 'rotate(270deg)' : 'unset' }}
              />
            )
          }
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
          ...(isNarrow ? { height: size } : { width: size }),
        }}
        position={isNarrow ? 'bottom' : 'start'}
        onMouseDown={(e) => isResizing && e.preventDefault()}
      >
        <Layers isNarrow={isNarrow} />
        <Resizer
          startResizing={startResizing}
          isResizing={isResizing}
          isOpen={isOpen}
        />
      </InlineDrawer>
    </div>
  )
})
