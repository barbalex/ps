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
const noDataStyle = {
  padding: 10,
  margin: 0,
}

export const Drawer = memo(
  forwardRef(({ isNarrow }) => {
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )
    const mapInfo = appState?.map_info

    const close = useCallback(
      (e) => {
        e.preventDefault()
        db.app_states.update({
          where: { app_state_id: appState?.app_state_id },
          data: { map_info: null },
        })
      },
      [appState?.app_state_id, db.app_states],
    )

    const layersExist = mapInfo?.layers?.length > 0

    return (
      <ErrorBoundary>
        <div
          style={{
            ...(isNarrow ? { marginTop: 4 } : { marginLeft: 4 }),
          }}
        >
          <DrawerHeader style={headerStyle}>
            <FormHeader
              title="Info"
              siblings={
                <Button
                  size="medium"
                  icon={<MdClose />}
                  onClick={close}
                  title="Close"
                />
              }
            />
          </DrawerHeader>
          <DrawerBody style={bodyStyle}>
            <Location mapInfo={mapInfo} />
            {layersExist ? (
              (mapInfo?.layers ?? []).map((layer, i) => (
                <Layer key={`${i}/${layer.label}`} layerData={layer} />
              ))
            ) : (
              <p style={noDataStyle}>No Data found at this location</p>
            )}
          </DrawerBody>
        </div>
      </ErrorBoundary>
    )
  }),
)
