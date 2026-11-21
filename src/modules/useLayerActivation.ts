import { useAtom } from 'jotai'

import { useUrlLayers } from './useUrlLayers.ts'
import { setLayerPresentationActive } from './setLayerPresentationActive.ts'
import { mapLayerSortingAtom } from '../store.ts'

/**
 * The map drawer's layer toggles: activating a layer means the design flag
 * (layer_presentations.active — what lists it under Active) AND membership
 * in the render list (the mapLayerSorting atom, or the ?layers= url
 * override when one is active). Deactivating reverses both.
 */
export const useLayerActivation = () => {
  const { isOverridden, setLayerVisible } = useUrlLayers()
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)

  // joining the render list is what makes an activated layer actually show
  const joinRenderList = (layerPresentationId: string) => {
    if (isOverridden) {
      setLayerVisible(layerPresentationId, true)
    } else if (!mapLayerSorting.includes(layerPresentationId)) {
      setMapLayerSorting([...mapLayerSorting, layerPresentationId])
    }
  }
  const leaveRenderList = (layerPresentationId: string) => {
    if (isOverridden) {
      setLayerVisible(layerPresentationId, false)
    } else {
      setMapLayerSorting(
        mapLayerSorting.filter((id) => id !== layerPresentationId),
      )
    }
  }

  const activateLayer = async (layerPresentationId: string) => {
    await setLayerPresentationActive(layerPresentationId, true)
    joinRenderList(layerPresentationId)
  }

  const deactivateLayer = async (layerPresentationId: string) => {
    leaveRenderList(layerPresentationId)
    await setLayerPresentationActive(layerPresentationId, false)
  }

  return { activateLayer, deactivateLayer, joinRenderList }
}
