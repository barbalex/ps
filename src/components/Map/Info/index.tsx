import { useCallback, useRef, useState, memo } from 'react'
import { useCorbado } from '@corbado/react'
import { useLiveQuery } from 'electric-sql/react'

import { ErrorBoundary } from '../../shared/ErrorBoundary.tsx'
import { Resize } from './Resize.tsx'
import { Drawer } from './Drawer/index.tsx'
import { isMobilePhone } from '../../../modules/isMobilePhone.ts'
import { useElectric } from '../../../ElectricProvider.tsx'

const drawerContainerStyle = {
  position: 'absolute',
  display: 'flex',
  zIndex: 10000,
  maxWidth: '100%',
}

export const Info = memo(() => {
  const { user: authUser } = useCorbado()
  const { db } = useElectric()!
  const isMobile = isMobilePhone()

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const mapInfo = appState?.map_info

  const animationFrame = useRef<number>(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [sidebarSize, setSidebarSize] = useState(320)

  const resize = useCallback(
    (props) => {
      const clientX = props?.location?.current?.input?.clientX
      const clientY = props?.location?.current?.input?.clientY
      animationFrame.current = requestAnimationFrame(async () => {
        if (sidebarRef.current) {
          const newSize = isMobile
            ? sidebarRef.current.getBoundingClientRect().bottom - clientY
            : sidebarRef.current.getBoundingClientRect().right - clientX
          if (newSize > 50) {
            setSidebarSize(newSize)
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
    [authUser?.email, db.app_states, isMobile],
  )

  return (
    <ErrorBoundary>
      <div
        style={{
          ...drawerContainerStyle,
          ...(isMobile ? { flexDirection: 'column' } : {}),
          ...(isMobile ? { bottom: 0 } : { right: 0, top: 0, height: '100%' }),
        }}
      >
        {!!mapInfo?.lat && <Resize resize={resize} isMobile={isMobile} />}
        <Drawer
          sidebarSize={sidebarSize}
          ref={sidebarRef}
          isMobile={isMobile}
        />
      </div>
    </ErrorBoundary>
  )
})
