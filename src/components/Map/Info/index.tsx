import { useCallback, useRef, useState, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
} from '@fluentui/react-components'

import { useElectric } from '../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../shared/ErrorBoundary.tsx'
import { Resize } from './Resize.tsx'
import { Drawer } from './Drawer.tsx'

const drawerContainerStyle = {
  position: 'relative',
  display: 'flex',
}
const drawerStyle = {
  willChange: 'width',
  transitionProperty: 'width',
  transitionDuration: 100,
}

export const Info = memo(({ redrawMap }) => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const mapInfo = appState?.map_info

  const animationFrame = useRef<number>(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const resize = useCallback(
    (props) => {
      const clientX = props?.location?.current?.input?.clientX
      animationFrame.current = requestAnimationFrame(() => {
        if (sidebarRef.current) {
          setSidebarWidth(
            sidebarRef.current.getBoundingClientRect().right - clientX,
          )
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
