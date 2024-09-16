import { memo, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { useAtom } from 'jotai'

import { useElectric } from '../../../../ElectricProvider.tsx'
import { Legend } from './Legend.tsx'
import { mapLayerSortingAtom } from '../../../../store.ts'

const layerListStyle = {}
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
      include: {
        layer_presentations: true,
        // wms_services: { include: { wms_service_layers: true } },
      },
    }),
  )
  const activeWmsLayers = wmsLayers.filter((l) =>
    (l.layer_presentations ?? []).some(
      (lp) => lp.wms_layer_id === l.wms_layer_id && lp.active,
    ),
  )

  // sort by mapLayerSorting
  const activeLayers = useMemo(
    () =>
      [...activeWmsLayers].sort((a, b) => {
        const aIndex = mapLayerSorting.findIndex(
          (ls) => ls === a.layer_presentations?.[0]?.layer_presentation_id,
        )
        const bIndex = mapLayerSorting.findIndex(
          (ls) => ls === b.layer_presentations?.[0]?.layer_presentation_id,
        )
        return aIndex - bIndex
      }),
    [activeWmsLayers, mapLayerSorting],
  )

  return activeLayers.length ? (
    activeLayers?.map((l, index) => (
      <div
        key={l.wms_layer_id}
        style={layerListStyle}
      >
        <Legend
          layer={l}
          isLast={index === activeLayers.length - 1}
        />
      </div>
    ))
  ) : (
    <p style={noLayersStyle}>No active layers</p>
  )
})
