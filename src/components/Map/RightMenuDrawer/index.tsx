import { useCallback, useRef, useState, useEffect } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { InlineDrawer } from '@fluentui/react-components'
import { useAtom } from 'jotai'

import { Info } from './Info/index.tsx'
import { Resizer } from './Resizer.tsx'
import { mapInfoAtom } from '../../../store.ts'

import styles from './index.module.css'

export const RightMenuDrawer = ({ containerRef }) => {
  const [mapInfo] = useAtom(mapInfoAtom)

  const animationFrame = useRef<number>(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)

  const startResizing = useCallback(() => setIsResizing(true), [])
  const stopResizing = useCallback(() => setIsResizing(false), [])

  const { width } = useResizeDetector({
    targetRef: containerRef,
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 100,
    refreshOptions: { leading: false, trailing: true },
  })
  const isNarrow = width < 700
  const [sidebarSize, setSidebarSize] = useState(isNarrow ? 500 : 320)

  const resize = useCallback(
    ({ clientX, clientY }) => {
      if (!isResizing) return
      if (!sidebarRef.current) return

      const newSidebarSize = isNarrow
        ? window.innerHeight - clientY
        : sidebarRef.current.getBoundingClientRect().right - clientX

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
      document
        ?.getElementsByClassName('map-container')?.[0]
        ?.classList.remove('row-resize', 'col-resize')
    }
  }, [isResizing, isNarrow])

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
      // dragging can mark text so we disable pointer events
      style={isResizing ? { pointerEvents: 'none' } : {}}
      className={`${styles.container} map-info-container`}
    >
      <InlineDrawer
        open={!!mapInfo?.lat}
        ref={sidebarRef}
        style={{
          ...(isNarrow ? { height: sidebarSize } : { width: sidebarSize }),
        }}
        className={styles.drawer}
        position={isNarrow ? 'bottom' : 'end'}
        onMouseDown={(e) => isResizing && e.preventDefault()}
      >
        <Info isNarrow={isNarrow} />
        <Resizer startResizing={startResizing} isResizing={isResizing} />
      </InlineDrawer>
    </div>
  )
}
