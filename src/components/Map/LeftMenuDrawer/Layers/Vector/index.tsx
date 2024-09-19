import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import {
  sectionStyle,
  layerListStyle,
  titleStyle,
  noneStyle,
} from '../styles.ts'
import { VectorLayer } from './VectorLayer.tsx'

export const VectorLayers = memo(() => {
  const { project_id } = useParams()

  const { db } = useElectric()!

  // TODO: when including layer_presentations, no results are returned
  // unlike with vector_layer_displays. Maybe because no layer_presentations exist?
  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: {
        type: { in: ['wfs', 'upload'] },
        ...(project_id ? { project_id } : {}),
      },
      // TODO: this only returns vector layers that have a presentation
      // https://github.com/electric-sql/electric/issues/1417
      include: { layer_presentations: true },
    }),
  )

  // 2. when one is set active, add layer_presentations for it
  const vectors = vectorLayers.filter(
    (l) =>
      !(l.layer_presentations ?? []).some(
        (lp) => lp.vector_layer_id === l.vector_layer_id && lp.active,
      ),
  )

  return (
    <ErrorBoundary>
      <section style={sectionStyle}>
        <h2 style={titleStyle}>Vectors</h2>
        <div style={layerListStyle}>
          {vectors.length ? (
            vectors.map((l) => (
              <VectorLayer
                layer={l}
                key={l.vector_layer_id}
              />
            ))
          ) : (
            <p style={noneStyle}>No inactive Vector Layers</p>
          )}
        </div>
      </section>
    </ErrorBoundary>
  )
})
