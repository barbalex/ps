import { useCallback, useRef, useState, memo } from 'react'

import { ErrorBoundary } from '../../shared/ErrorBoundary.tsx'
import { Resize } from './Resize.tsx'
import { Drawer } from './Drawer.tsx'

const drawerContainerStyle = {
  position: 'relative',
  display: 'flex',
}

export const Info = memo(({ redrawMap }) => {
  const animationFrame = useRef<number>(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const resize = useCallback(
    (props) => {
      const clientX = props?.location?.current?.input?.clientX
      animationFrame.current = requestAnimationFrame(() => {
        if (sidebarRef.current) {
          const newWidth =
            sidebarRef.current.getBoundingClientRect().right - clientX
          // TODO: if newWidth is less than 50, close the sidebar
          setSidebarWidth(newWidth)
          setTimeout(redrawMap, 200)
        }
      })
    },
    [redrawMap],
  )

  return (
    <ErrorBoundary>
      <div style={drawerContainerStyle}>
        <Resize resize={resize} />
        <Drawer sidebarWidth={sidebarWidth} ref={sidebarRef} />
      </div>
    </ErrorBoundary>
  )
})
