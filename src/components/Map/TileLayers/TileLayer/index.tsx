import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbadoSession } from '@corbado/react'

import { Tile_layers as TileLayer } from '../../../../generated/client'
import { WMS } from './WMS'
// import { WMTSOffline } from './WMTSOffline'
import { LocalMap } from './LocalMap'
import { useElectric } from '../../../../ElectricProvider.tsx'

interface Props {
  layer: TileLayer
}

export const TileLayerComponent = memo(({ layer }: Props) => {
  const { user: authUser } = useCorbadoSession()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const showLocalMap = appState?.show_local_map?.[layer.id]?.show ?? false

  if (layer.type === 'wmts') {
    return (
      <>
        {showLocalMap && <LocalMap layer={layer} />}
        {/* TODO: get offline wmts to work */}
        {/* <WMTSOffline layer={layer} /> */}
      </>
    )
  } else {
    return <WMS layer={layer} />
  }
})
