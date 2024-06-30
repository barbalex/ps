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
      const newSidebarSize = isNarrow
        ? window.innerHeight - clientY
        : sidebarRef.current.getBoundingClientRect().right - clientX
      console.log('Map Info.resize', {
        clientX,
        clientY,
        sidebarBoundingClientRect: sidebarRef.current.getBoundingClientRect(),
        newSidebarSize,
        sidebarBottom: sidebarRef.current.getBoundingClientRect().bottom,
        sidebarTop: sidebarRef.current.getBoundingClientRect().top,
      })
      animationFrame.current = requestAnimationFrame(() => {
        setSidebarSize(newSidebarSize)
      })
    },
    [isNarrow, isResizing],
  )

  useEffect(() => {
    window.addEventListener('mousemove', resize)
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
      className="map-info-container"
      style={{
        ...drawerContainerStyle,
        ...(isResizing ? { pointerEvents: 'none' } : {}),
      }}
      onMouseDown={startResizing}
    >
      <Drawer ref={sidebarRef} isNarrow={isNarrow} sidebarSize={sidebarSize} />
      <Resizer startResizing={startResizing} />
    </div>
  )
})
