import { memo, forwardRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import {
  DrawerBody,
  DrawerHeader,
  InlineDrawer,
} from '@fluentui/react-components'

import { useElectric } from '../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { FormHeader } from '../../../FormHeader/index.tsx'
import { Location } from './Location.tsx'

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

    const [location, ...layersData] = mapInfo ?? []
    console.log('Map Info, Drawer', { location, layersData })

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
            <Location location={location} />
          </DrawerBody>
        </InlineDrawer>
      </ErrorBoundary>
    )
  }),
)
