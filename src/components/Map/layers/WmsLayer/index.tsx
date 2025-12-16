import { useAtomValue } from 'jotai'

import { WMS } from './WMS.tsx'
// import { WMTSOffline } from './WMTSOffline'
import { LocalMap } from './LocalMap.tsx'
import { showLocalMapAtom } from '../../../../store.ts'

export const WmsLayerComponent = ({ layerPresentation, layer }) => {
  const showLocalMap = useAtomValue(showLocalMapAtom)

  if (layer.type === 'wmts') {
    return (
      <>
        {showLocalMap && <LocalMap layerPresentation={layerPresentation} />}
        {/* TODO: get offline wmts to work */}
        {/* <WMTSOffline layer={layer} /> */}
      </>
    )
  } else {
    return (
      <WMS
        layerPresentation={layerPresentation}
        layer={layer}
      />
    )
  }
}
