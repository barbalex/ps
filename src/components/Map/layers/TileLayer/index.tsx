import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Layer_presentations as LayerPresentation } from '../../../../generated/client/index.ts'
import { WMS } from './WMS.tsx'
// import { WMTSOffline } from './WMTSOffline'
import { LocalMap } from './LocalMap.tsx'
import { useElectric } from '../../../../ElectricProvider.tsx'

interface Props {
  layerPresentation: LayerPresentation
}

export const TileLayerComponent = memo(({ layerPresentation }: Props) => {
  const { user: authUser } = useCorbado()

  const layer = layerPresentation.tile_layers

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const showLocalMap = appState?.show_local_map?.[layer.id]?.show ?? false

  if (layer.type === 'wmts') {
    return (
      <>
        {showLocalMap && <LocalMap layerPresentation={layerPresentation} />}
        {/* TODO: get offline wmts to work */}
        {/* <WMTSOffline layer={layer} /> */}
      </>
    )
  } else {
    return <WMS layerPresentation={layerPresentation} />
  }
})
