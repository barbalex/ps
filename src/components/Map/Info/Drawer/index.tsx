import { memo, forwardRef, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import {
  Button,
  DrawerBody,
  DrawerHeader,
  InlineDrawer,
} from '@fluentui/react-components'
import { MdClose } from 'react-icons/md'

import { useElectric } from '../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { FormHeader } from '../../../FormHeader/index.tsx'
import { Location } from './Location.tsx'
import { Layer } from './Layer.tsx'

const headerStyle = {
  padding: 0,
}
const bodyStyle = { padding: 0 }

export const Drawer = memo(
  forwardRef(({ sidebarSize, redrawMap, isMobile }, ref) => {
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )
    const mapInfo = appState?.map_info

    const [location, ...layersData] = mapInfo ?? []

    const close = useCallback(() => {
      db.app_states.update({
        where: { app_state_id: appState?.app_state_id },
        data: { map_info: null },
      })
      setTimeout(redrawMap, 200)
    }, [appState?.app_state_id, db.app_states, redrawMap])

    return (
      <ErrorBoundary>
        <InlineDrawer
          open={mapInfo?.length > 0}
          ref={ref}
          style={{
            // display: 'flex',
            // flexDirection: isMobile ? 'column' : 'row',
            width: '100%',
            ...(isMobile ? { height: sidebarSize } : { width: sidebarSize }),
            transitionProperty: isMobile ? 'height' : 'width',
            willChange: isMobile ? 'height' : 'width',
            transitionDuration: 100,
          }}
        >
          <DrawerHeader style={headerStyle}>
            <FormHeader
              title="Info"
              siblings={[
                <Button
                  size="medium"
                  icon={<MdClose />}
                  onClick={close}
                  title="Close"
                />,
              ]}
            />
          </DrawerHeader>
          <DrawerBody style={bodyStyle}>
            <Location mapInfo={mapInfo} />
            {(mapInfo.layers ?? []).map((layer, i) => (
              <Layer key={`${i}/${layer.label}`} layerData={layer} />
            ))}
          </DrawerBody>
        </InlineDrawer>
      </ErrorBoundary>
    )
  }),
)
