import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
// import { useCorbado } from '@corbado/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { FormHeader } from '../../../FormHeader/index.tsx'

export const Layers = memo(({ isNarrow }) => {
  const { project_id } = useParams()
  // const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  // 1. list all layers (own, tile, vector)
  const { results: tileLayers = [] } = useLiveQuery(
    db.tile_layers.liveMany({
      where: { ...(project_id ? { project_id } : {}) },
    }),
  )
  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: { ...(project_id ? { project_id } : {}) },
    }),
  )
  // 2. when one is set active, add layer_presentations for it

  console.log('Map Layers:', { tileLayers, vectorLayers })

  return (
    <ErrorBoundary>
      <div
        style={{
          width: '100%',
          ...(isNarrow ? { marginTop: 5 } : { marginRight: 5 }),
        }}
      >
        <FormHeader
          title="Layers"
          titleMarginLeft={isNarrow ? 34 : undefined}
        />
        <h2>Tile Layers</h2>
        {tileLayers?.map((l) => (
          <div key={l.tile_layer_id}>{l.label}</div>
        ))}
        <h2>Vector Layers</h2>
        {vectorLayers?.map((l) => (
          <div key={l.vector_layer_id}>{l.label}</div>
        ))}
      </div>
    </ErrorBoundary>
  )
})
