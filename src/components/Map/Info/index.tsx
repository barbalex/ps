import { useCallback, useRef, useState, memo } from 'react'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../shared/ErrorBoundary.tsx'
import { Resize } from './Resize.tsx'
import { Drawer } from './Drawer/index.tsx'

const drawerContainerStyle = {
  position: 'relative',
  display: 'flex',
}

export const Info = memo(({ redrawMap }) => {
  const { user: authUser } = useCorbado()
  const { db } = useElectric()!

  const animationFrame = useRef<number>(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const resize = useCallback(
    (props) => {
      const clientX = props?.location?.current?.input?.clientX
      animationFrame.current = requestAnimationFrame(async () => {
        if (sidebarRef.current) {
          const newWidth =
            sidebarRef.current.getBoundingClientRect().right - clientX
          if (newWidth > 50) {
            setSidebarWidth(newWidth)
            setTimeout(redrawMap, 200)
            return
          }
          // if newWidth is less than 50, close the sidebar
          const appState = await db.app_states.findFirst({
            where: { user_email: authUser?.email },
          })
          db.app_states.update({
            where: { app_state_id: appState?.app_state_id },
            data: { map_info: null },
          })
        }
      })
    },
    [authUser?.email, db.app_states, redrawMap],
  )

  return (
    <ErrorBoundary>
      <div style={drawerContainerStyle}>
        <Resize resize={resize} />
        <Drawer sidebarWidth={sidebarWidth} ref={sidebarRef} redrawMap={redrawMap} />
      </div>
    </ErrorBoundary>
  )
})
