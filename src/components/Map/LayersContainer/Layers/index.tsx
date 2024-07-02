import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
// import { useCorbado } from '@corbado/react'
import { useParams } from 'react-router-dom'
import { Checkbox } from '@fluentui/react-components'

import { useElectric } from '../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { FormHeader } from '../../../FormHeader/index.tsx'

const formStyle = {
  paddingLeft: 10,
  paddingRight: 10,
  paddingBottom: 10,
  // enable scrolling
  overflowY: 'auto',
  height: '100%',
}
const layerListStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}

export const Layers = memo(({ isNarrow }) => {
  const { project_id } = useParams()
  // const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  // 1. list all layers (own, tile, vector)
  const where = project_id ? { project_id } : {}
  // TODO: when including layer_presentations, no results are returned
  // unlike with vector_layer_displays. Maybe because no layer_presentations exist?
  const { results: tileLayers = [] } = useLiveQuery(
    db.tile_layers.liveMany({
      where,
      // include: { layer_presentations: true },
    }),
  )
  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where,
      // TODO: this only returns vector layers that have a presentation
      // https://github.com/electric-sql/electric/issues/1417
      // include: { layer_presentations: true },
    }),
  )
  // fetch all layer_presentations for the vector layers
  const { results: layerPresentations = [] } = useLiveQuery(
    db.layer_presentations.liveMany({
      where: {
        OR: [
          {
            vector_layer_id: { in: vectorLayers.map((l) => l.vector_layer_id) },
          },
          { tile_layer_id: { in: tileLayers.map((l) => l.tile_layer_id) } },
        ],
      },
    }),
  )
  // 2. when one is set active, add layer_presentations for it

  console.log('Map Layers:', {
    tileLayers,
    vectorLayers,
    where,
    layerPresentations,
  })

  return (
    <ErrorBoundary>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          ...(isNarrow ? { marginTop: 5 } : { marginRight: 5 }),
        }}
      >
        <FormHeader
          title="Layers"
          titleMarginLeft={isNarrow ? 34 : undefined}
        />
        <div style={formStyle}>
          <h2>Active Layers</h2>
          <h2>Tile Layers</h2>
          <div style={layerListStyle}>
            {tileLayers?.map((l) => (
              <Checkbox key={l.tile_layer_id} size="large" label={l.label} />
            ))}
          </div>
          <h2>Vector Layers</h2>
          <div style={layerListStyle}>
            {vectorLayers?.map((l) => (
              <Checkbox key={l.vector_layer_id} size="large" label={l.label} />
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
})
