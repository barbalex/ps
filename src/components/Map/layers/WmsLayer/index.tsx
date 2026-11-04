import { useAtomValue } from 'jotai'

import type LayerPresentations from '../../../../models/public/LayerPresentations.ts'
import { WMS, type WmsLayerWithServiceInfo } from './WMS.tsx'
import { LocalMap } from './LocalMap.tsx'
import { showLocalMapAtom } from '../../../../store.ts'

type Props = {
  layerPresentation: LayerPresentations
  layer: WmsLayerWithServiceInfo
}

export const WmsLayerComponent = ({ layerPresentation, layer }: Props) => {
  const showLocalMap = useAtomValue(showLocalMapAtom)

  if (layer.type === 'wmts') {
    return (
      <>
        {showLocalMap && <LocalMap layerPresentation={layerPresentation} />}
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
