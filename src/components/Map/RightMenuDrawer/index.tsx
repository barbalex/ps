import { useCallback, useRef, useState, useEffect } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { InlineDrawer } = fluentUiReactComponents
import { useAtom } from 'jotai'

import { Info } from './Info/index.tsx'
import { Resizer } from './Resizer.tsx'
import { mapInfoAtom } from '../../../store.ts'

import styles from './index.module.css'

// a drag that ends with less than this closes the drawer: it has no toggle
// outside of itself, so a thinner one could neither be closed nor widened
const closedBelow = 40

export const RightMenuDrawer = ({ isNarrow }: { isNarrow: boolean }) => {
  const [mapInfo, setMapInfo] = useAtom(mapInfoAtom)

  const animationFrame = useRef<number>(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  // the drawer's root; the map area is its parent
  const rootRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)

  const [sidebarSize, setSidebarSize] = useState(isNarrow ? 500 : 320)
  // a drag is active; the size when it began — what the drawer has again
  // after it was dragged shut — and how small it has made the drawer so far
  const dragging = useRef(false)
  const sizeAtDragStart = useRef(sidebarSize)
  const draggedSize = useRef(Number.POSITIVE_INFINITY)

  const startResizing = useCallback(() => {
    sizeAtDragStart.current = sidebarSize
    draggedSize.current = Number.POSITIVE_INFINITY
    dragging.current = true
    setIsResizing(true)
  }, [sidebarSize])
  const stopResizing = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    setIsResizing(false)
    if (draggedSize.current >= closedBelow) return
    // dragged shut: close it now that the drag is over, with the size it
    // had before for the next time it opens
    cancelAnimationFrame(animationFrame.current)
    setMapInfo(null)
    setSidebarSize(sizeAtDragStart.current)
  }, [setMapInfo])

  const resize = useCallback(
    ({ clientX, clientY }: { clientX: number; clientY: number }) => {
      if (!isResizing) return
      if (!sidebarRef.current) return

      // the map area: larger than it, the drawer's resizer and close
      // button are clipped out of reach
      const map = rootRef.current?.parentElement?.getBoundingClientRect()
      // narrow: the drawer grows up from the map's bottom edge
      draggedSize.current =
        isNarrow ?
          (map?.bottom ?? window.innerHeight) - clientY
        : sidebarRef.current.getBoundingClientRect().right - clientX
      const mapExtent = isNarrow ? map?.height : map?.width
      const newSidebarSize = Math.max(
        0,
        Math.min(draggedSize.current, mapExtent ?? Number.POSITIVE_INFINITY),
      )

      animationFrame.current = requestAnimationFrame(() =>
        setSidebarSize(newSidebarSize),
      )
    },
    [isNarrow, isResizing],
  )

  // while resizing, cursor needs to be:
  // row-resize (narrow) or col-resize (wide)
  // but it is: grab, because mouse leaves the resizer
  useEffect(() => {
    if (isResizing) {
      document
        ?.getElementsByClassName('map-container')?.[0]
        ?.classList.add(isNarrow ? 'row-resize' : 'col-resize')
    } else {
      document
        ?.getElementsByClassName('map-container')?.[0]
        ?.classList.remove('row-resize', 'col-resize')
    }

    return () => {
      // using useBeforeunload changed the behavior negatively
      document
        ?.getElementsByClassName('map-container')?.[0]
        ?.classList.remove('row-resize', 'col-resize')
    }
  }, [isResizing, isNarrow])

  useEffect(() => {
    window.addEventListener('mousemove', resize)
    // these events can't be added to the resizer's events
    // because on dragging the mouse immediately leaves the resizer
    // pointerup, not mouseup: released over the map toolbar's top button,
    // no mouseup reaches the window and the drag never ended
    window.addEventListener('pointerup', stopResizing)
    window.addEventListener('mouseleave', stopResizing)

    return () => {
      // using useBeforeunload changed the behavior negatively
      cancelAnimationFrame(animationFrame.current)
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('pointerup', stopResizing)
      window.removeEventListener('mouseleave', stopResizing)
    }
  }, [resize, stopResizing])

  return (
    <div
      // dragging can mark text so we disable pointer events
      className={`${styles.container}${isResizing ? ` ${styles.dragging}` : ''}`}
      ref={rootRef}
    >
      <InlineDrawer
        open={!!mapInfo?.lat}
        ref={sidebarRef}
        style={{ '--right-drawer-size': `${sidebarSize}px` } as React.CSSProperties}
        className={`map-info-drawer ${styles.drawer}${isNarrow ? ` ${styles.drawerNarrow}` : ` ${styles.drawerWide}`}`}
        position={isNarrow ? 'bottom' : 'end'}
        onMouseDown={(e) => isResizing && e.preventDefault()}
      >
        <Info />
        <Resizer startResizing={startResizing} isResizing={isResizing} />
      </InlineDrawer>
    </div>
  )
}
