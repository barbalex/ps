import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { Accordion } from '@fluentui/react-components'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { ActiveLayer } from './Active.tsx'

const titleStyle = {
  paddingLeft: 10,
  paddingRight: 10,
}
const layerListStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}
const noLayersStyle = {
  // borderTop: '1px solid rgba(55, 118, 28, 0.5)',
  // borderBottom: '1px solid rgba(55, 118, 28, 0.5)',
  margin: 0,
  paddingLeft: 10,
  paddingRight: 10,
  paddingBottom: 10,
}

export const ActiveLayers = memo(() => {
  const { project_id } = useParams()

  const { db } = useElectric()!
  const where = project_id ? { project_id } : {}

  const { results: tileLayers = [] } = useLiveQuery(
    db.tile_layers.liveMany({
      where,
      include: { layer_presentations: true },
    }),
  )
  const activeTileLayers = tileLayers.filter((l) =>
    l.layer_presentations.some(
      (lp) => lp.tile_layer_id === l.tile_layer_id && lp.active,
    ),
  )

  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where,
      include: { layer_presentations: true },
    }),
  )
  const activeVectorLayers = vectorLayers.filter((l) =>
    l.layer_presentations.some(
      (lp) => lp.vector_layer_id === l.vector_layer_id && lp.active,
    ),
  )

  const activeLayers = [...activeTileLayers, ...activeVectorLayers]

  return (
    <ErrorBoundary>
      <section>
        <h2 style={titleStyle}>Active</h2>
        <div style={layerListStyle}>
          <Accordion multiple collapsible>
            {activeLayers.length ? (
              activeLayers?.map((l) => (
                <ActiveLayer
                  key={l.tile_layer_id ?? l.vector_layer_id}
                  layer={l}
                />
              ))
            ) : (
              <p style={noLayersStyle}>No active layers</p>
            )}
          </Accordion>
        </div>
      </section>
    </ErrorBoundary>
  )
})
