import { memo, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { useAtom } from 'jotai'

import { useElectric } from '../../../../ElectricProvider.tsx'
import { WmsLegend } from './WmsLegend.tsx'
import { VectorLegend } from './VectorLegend.tsx'
import { mapLayerSortingAtom } from '../../../../store.ts'
import { LegendContainer } from './LegendContainer.tsx'

const noLayersStyle = {
  margin: 0,
  paddingLeft: 10,
  paddingRight: 10,
  paddingBottom: 10,
}

export const Legends = memo(() => {
  const [mapLayerSorting] = useAtom(mapLayerSortingAtom)
  const { project_id } = useParams()

  const { db } = useElectric()!

  const where = project_id ? { project_id } : {}
  const { results: wmsLayers = [] } = useLiveQuery(
    db.wms_layers.liveMany({
      where,
      include: { layer_presentations: true },
    }),
  )
  const activeWmsLayers = wmsLayers.filter((l) =>
    (l.layer_presentations ?? []).some(
      (lp) => lp.wms_layer_id === l.wms_layer_id && lp.active,
    ),
  )

  // same for vector layers
  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where,
      include: { layer_presentations: true },
    }),
  )
  const activeVectorLayers = vectorLayers.filter((l) =>
    (l.layer_presentations ?? []).some(
      (lp) => lp.vector_layer_id === l.vector_layer_id && lp.active,
    ),
  )

  // sort by mapLayerSorting
  const activeLayers = useMemo(
    () =>
      [...activeWmsLayers, ...activeVectorLayers].sort((a, b) => {
        const aIndex = mapLayerSorting.findIndex(
          (ls) => ls === a.layer_presentations?.[0]?.layer_presentation_id,
        )
        const bIndex = mapLayerSorting.findIndex(
          (ls) => ls === b.layer_presentations?.[0]?.layer_presentation_id,
        )
        return aIndex - bIndex
      }),
    [activeVectorLayers, activeWmsLayers, mapLayerSorting],
  )

  return activeLayers.length ? (
    activeLayers?.map((layer, index) => {
      // display depends on layer type: wms / vector
      const isVectorLayer = 'vector_layer_id' in layer

      return (
        <LegendContainer
          key={layer.wms_layer_id ?? layer.vector_layer_id}
          layer={layer}
          isLast={index === activeLayers.length - 1}
        >
          {isVectorLayer ? (
            <VectorLegend layer={layer} />
          ) : (
            <WmsLegend layer={layer} />
          )}
        </LegendContainer>
      )
    })
  ) : (
    <p style={noLayersStyle}>No active layers</p>
  )
})
