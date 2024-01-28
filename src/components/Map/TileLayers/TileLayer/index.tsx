import { useLiveQuery } from 'electric-sql/react'

import {
  Tile_layers as TileLayer,
  Ui_options as UiOption,
} from '../../../../generated/client'
import { WMS } from './WMS'
// import { WMTSOffline } from './WMTSOffline'
import { LocalMap } from './LocalMap'
import { useElectric } from '../../../../ElectricProvider'
import { user_id } from '../../../SqlInitializer'

type Props = {
  layer: TileLayer
}

export const TileLayerComponent = ({ layer }: Props) => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({
      where: { user_id },
      select: { local_map_show: true },
    }),
  )
  const uiOption: UiOption = results
  const showLocalMap = uiOption?.local_map_show?.[layer.id]?.show ?? false

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
}
