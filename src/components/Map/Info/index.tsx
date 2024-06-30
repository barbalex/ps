import { useCallback, useRef, memo, useState, useEffect } from 'react'
import { useResizeDetector } from 'react-resize-detector'

import { Drawer } from './Drawer/index.tsx'
import { Resizer } from './Resizer.tsx'

import './index.css'

const drawerContainerStyle = {
  position: 'absolute',
  display: 'flex',
  zIndex: 10000,
  maxWidth: '100%',
}

export const Info = memo(({ containerRef }) => {
  const animationFrame = useRef<number>(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)

  const startResizing = useCallback(() => setIsResizing(true), [])
  const stopResizing = useCallback(() => setIsResizing(false), [])

  const { width, height } = useResizeDetector({
    targetRef: containerRef,
    // handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 100,
    refreshOptions: { leading: false, trailing: true },
  })
  const isNarrow = width < 700
  const [sidebarSize, setSidebarSize] = useState(isNarrow ? 500 : 320)
  console.log('Map Info', { width, height, isNarrow, isResizing })

  const resize = useCallback(
    ({ clientX, clientY }) => {
      if (!isResizing) return
      if (!sidebarRef.current) return
      console.log('Map Info.resize', {
        clientX,
        clientY,
        sidebarBoundingClientRect: sidebarRef.current.getBoundingClientRect(),
        sidebarSize: isNarrow
          ? sidebarRef.current.getBoundingClientRect().bottom - clientY
          : sidebarRef.current.getBoundingClientRect().right - clientX,
        sidebarBottom: sidebarRef.current.getBoundingClientRect().bottom,
        sidebarTop: sidebarRef.current.getBoundingClientRect().top,
      })
      animationFrame.current = requestAnimationFrame(() => {
        setSidebarSize(
          isNarrow
            ? window.innerHeight - clientY
            : sidebarRef.current.getBoundingClientRect().right - clientX,
        )
      })
    },
    [isNarrow, isResizing],
  )

  useEffect(() => {
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup mouseleave', stopResizing)

    return () => {
      cancelAnimationFrame(animationFrame.current)
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup mouseleave', stopResizing)
    }
  }, [resize, stopResizing])

  return (
    <div
      className="map-info-container"
      style={{
        ...drawerContainerStyle,
        ...(isResizing ? { pointerEvents: 'none' } : {}),
      }}
      onMouseDown={startResizing}
    >
      <Drawer ref={sidebarRef} isNarrow={isNarrow} sidebarWidth={sidebarSize} />
      <Resizer startResizing={startResizing} />
    </div>
  )
})
