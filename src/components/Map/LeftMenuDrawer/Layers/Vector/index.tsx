import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { Checkbox } from '@fluentui/react-components'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import {
  sectionStyle,
  layerListStyle,
  titleStyle,
  noneStyle,
} from '../styles.ts'

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

  const onChange = useCallback(
    async (layer) => {
      console.log('VectorLayers.onChange layer:', layer)
      // 3. if yes, update it
      db.layer_presentations.update({
        where: {
          layer_presentation_id:
            layer.layer_presentations?.[0]?.layer_presentation_id,
        },
        data: { active: true },
      })
    },
    [db],
  )

  return (
    <ErrorBoundary>
      <section style={sectionStyle}>
        <h2 style={titleStyle}>Vectors</h2>
        <div style={layerListStyle}>
          {vectors.length ? (
            vectors.map((l) => (
              <Checkbox
                key={l.vector_layer_id}
                size="large"
                label={l.label}
                // checked if layer has an active presentation
                // always false because of the filter
                checked={false}
                onChange={() => onChange(l)}
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
