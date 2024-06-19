import { memo, forwardRef } from 'react'
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

const drawerStyle = {
  willChange: 'width',
  transitionProperty: 'width',
  transitionDuration: 100,
}

export const Drawer = memo(
  forwardRef(({ sidebarWidth }, ref) => {
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )
    const mapInfo = appState?.map_info

    return (
      <ErrorBoundary>
        <InlineDrawer
          open={mapInfo?.length > 0}
          ref={ref}
          style={{ width: sidebarWidth, ...drawerStyle }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <DrawerHeader>
            <DrawerHeaderTitle>Default Drawer</DrawerHeaderTitle>
          </DrawerHeader>
          <DrawerBody>
            <p>Resizable content</p>
          </DrawerBody>
        </InlineDrawer>
      </ErrorBoundary>
    )
  }),
)
