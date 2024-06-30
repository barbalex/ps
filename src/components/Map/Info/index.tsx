import { useCallback, useRef, memo, useState, useEffect } from 'react'

import { Drawer } from './Drawer/index.tsx'
import { isMobilePhone } from '../../../modules/isMobilePhone.ts'
import { Resizer } from './Resizer.tsx'

import './index.css'

const drawerContainerStyle = {
  position: 'absolute',
  display: 'flex',
  zIndex: 10000,
  maxWidth: '100%',
}

export const Info = memo(() => {
  const isMobile = isMobilePhone()

  const animationFrame = useRef<number>(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)

  const startResizing = useCallback(() => setIsResizing(true), [])
  const stopResizing = useCallback(() => setIsResizing(false), [])

  const resize = useCallback(
    ({ clientX }) => {
      if (!isResizing) return
      console.log('Map Info.resize', {
        clientX,
        isResizing,
        sidebarLeft: sidebarRef.current?.getBoundingClientRect().right,
        newSidebarWidth:
          sidebarRef.current.getBoundingClientRect().right - clientX,
      })
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

  return (
    <div
      className="map-info-container"
      style={drawerContainerStyle}
      onMouseDown={startResizing}
      // style={{ ...(isResizing ? { userSelect: 'none' } : {}) }}
    >
      <Drawer
        ref={sidebarRef}
        isMobile={isMobile}
        sidebarWidth={sidebarWidth}
      />
      <Resizer startResizing={startResizing} />
    </div>
  )
})
