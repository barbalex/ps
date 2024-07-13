import { memo, useMemo, useContext } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../../../ElectricProvider.tsx'
import { IsNarrowContext } from '../IsNarrowContext.ts'
import { Legend } from './Legend.tsx'

const layerListStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}
const noLayersStyle = {
  margin: 0,
  paddingLeft: 10,
  paddingRight: 10,
  paddingBottom: 10,
}

export const Legends = memo(() => {
  const { project_id } = useParams()
  const isNarrow = useContext(IsNarrowContext)

  const { db } = useElectric()!
  const { user: authUser } = useCorbado()

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({
      where: { user_email: authUser?.email },
    }),
  )
  const layerSorting = useMemo(
    () => appState?.map_layer_sorting ?? [],
    [appState],
  )

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

  // sort by app_states.map_layer_sorting
  const activeLayers = useMemo(
    () =>
      [...activeWmsLayers].sort((a, b) => {
        const aIndex = layerSorting.findIndex(
          (ls) => ls === a.layer_presentations?.[0]?.layer_presentation_id,
        )
        const bIndex = layerSorting.findIndex(
          (ls) => ls === b.layer_presentations?.[0]?.layer_presentation_id,
        )
        return aIndex - bIndex
      }),
    [activeWmsLayers, layerSorting],
  )

  return activeLayers.length ? (
    activeLayers?.map((l, index) => (
      <div
        style={{
          ...layerListStyle,
          ...(isNarrow ? {} : { width: 'calc(100% - 6px)' }),
        }}
      >
        <Legend
          key={l.wms_layer_id}
          layer={l}
          index={index}
          layerCount={activeLayers.length}
          isLast={index === activeLayers.length - 1}
        />
      </div>
    ))
  ) : (
    <p style={noLayersStyle}>No active layers</p>
  )
})
