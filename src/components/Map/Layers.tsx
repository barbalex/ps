import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../ElectricProvider.tsx'

export const Layers = memo(() => {
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const mapLayerSorting = appState?.map_layer_sorting ?? []

  // for every layer_presentation_id in mapLayerSorting, get the layer_presentation
  const { results: layerPresentations = [] } = useLiveQuery(
    db.layer_presentations.liveMany({
      where: { layer_presentation_id: { in: mapLayerSorting } },
    }),
  )
  const vectorLayerIds = layerPresentations.map((lp) => lp.vector_layer_id)
  const tileLayerIds = layerPresentations.map((lp) => lp.tile_layer_id)

  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: { vector_layer_id: { in: vectorLayerIds } },
    }),
  )

  const { results: tileLayers = [] } = useLiveQuery(
    db.tile_layers.liveMany({
      where: { tile_layer_id: { in: tileLayerIds } },
    }),
  )

  console.log('Layers', {
    vectorLayers,
    tileLayers,
    layerPresentations,
    mapLayerSorting,
  })

  return null
})
