import { memo } from 'react'
import { useAtom } from 'jotai'

import { WMS } from './WMS.tsx'
// import { WMTSOffline } from './WMTSOffline'
import { LocalMap } from './LocalMap.tsx'
import { showLocalMapAtom } from '../../../../store.ts'

export const WmsLayerComponent = memo(({ layerPresentation, layer }) => {
  const [showLocalMap] = useAtom(showLocalMapAtom)

  if (layer.type === 'wmts') {
    return (
      <>
        {showLocalMap && <LocalMap layerPresentation={layerPresentation} />}
        {/* TODO: get offline wmts to work */}
        {/* <WMTSOffline layer={layer} /> */}
      </>
    )
  } else {
    return <WMS layerPresentation={layerPresentation} layer={layer} />
  }
})
