import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { useElectric } from '../../ElectricProvider.tsx'
import {
  Tile_layers as TileLayer,
  Vector_layers as VectorLayer,
} from '../../../generated/client/index.ts'

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
      include: { vector_layers: true, tile_layers: true },
    }),
  )

  console.log('Layers', {
    layerPresentations,
    mapLayerSorting,
  })

  // return an array of layerPresentations
  // for every one determine if is: tile, wfs, own (table)

  return mapLayerSorting.map((layerPresentationId) => {
    const layerPresentation = layerPresentations.find(
      (lp) => lp.layer_presentation_id === layerPresentationId,
    )

    if (!layerPresentation) return null

    const tileLayer: TileLayer | undefined = layerPresentation.tile_layers
    const vectorLayer: VectorLayer | undefined = layerPresentation.vector_layers
    const wfsLayer = vectorLayer?.type === 'wfs' ? vectorLayer : null
    const tableLayer =
      vectorLayer?.type && vectorLayer.type !== 'wfs' ? vectorLayer : null

    if (tileLayer) {
      // return <TileLayerComponent key={layerPresentationId} layerPresentation={layerPresentation} />
    }

    if (wfsLayer) {
      // return <VectorLayerComponent key={layerPresentationId} layerPresentation={layerPresentation} />
    }

    if (tableLayer) {
      // return <OwnLayerComponent key={layerPresentationId} layerPresentation={layerPresentation} />
    }

    return null
  })
})
