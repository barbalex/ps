import { useContext } from 'react'
import { observer } from 'mobx-react-lite'

import { TileLayer } from '../../../../dexieClient'
import WMS from './WMS'
import WMTS from './WMTSOffline'
import storeContext from '../../../../storeContext'
import LocalMap from './LocalMap'

type Props = {
  layer: TileLayer
}

const TileLayerComponent = ({ layer }: Props) => {
  const { localMapShow } = useContext(storeContext)
  const showLocalMap = localMapShow.get(layer.id)?.show ?? false

  if (layer.type === 'wmts') {
    return (
      <>
        {showLocalMap && <LocalMap layer={layer} />}
        <WMTS layer={layer} />
      </>
    )
  } else {
    return <WMS layer={layer} />
  }
}

export default observer(TileLayerComponent)
