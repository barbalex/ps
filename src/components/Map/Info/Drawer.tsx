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
import { FormHeader } from '../../FormHeader/index.tsx'

const drawerStyle = {
  willChange: 'width',
  transitionProperty: 'width',
  transitionDuration: 100,
}
const headerStyle = {
  padding: 0,
}

export const Drawer = memo(
  forwardRef(({ sidebarWidth }, ref) => {
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )
    const mapInfo = appState?.map_info

    const [location, ...rest] = mapInfo ?? []
    const lng = Math.round(location?.lng * 10000000) / 10000000
    const lat = Math.round(location?.lat * 10000000) / 10000000
    console.log('Map Info, Drawer', { location, rest })

    return (
      <ErrorBoundary>
        <InlineDrawer
          id="drawer"
          open={mapInfo?.length > 0}
          ref={ref}
          style={{ width: sidebarWidth, ...drawerStyle }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <DrawerHeader style={headerStyle}>
            <FormHeader title="Info" />
          </DrawerHeader>
          <DrawerBody>
            <h3>Location</h3>
            <p>{`WGS84: ${lng} / ${lat}`}</p>
          </DrawerBody>
        </InlineDrawer>
      </ErrorBoundary>
    )
  }),
)
