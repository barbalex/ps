import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { Checkbox } from '@fluentui/react-components'

import { useElectric } from '../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../modules/createRows.ts'
import {
  sectionStyle,
  layerListStyle,
  titleStyle,
  noneStyle,
} from './styles.ts'

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
      // include: { layer_presentations: true },
    }),
  )

  // fetch all layer_presentations for the vector layers
  const { results: layerPresentations = [] } = useLiveQuery(
    db.layer_presentations.liveMany({
      where: {
        vector_layer_id: { in: vectorLayers.map((l) => l.vector_layer_id) },
      },
    }),
  )
  // 2. when one is set active, add layer_presentations for it
  const vectors = vectorLayers.filter(
    (l) =>
      !layerPresentations.some(
        (lp) => lp.vector_layer_id === l.vector_layer_id && lp.active,
      ),
  )

  const onChange = useCallback(
    async (layer) => {
      // 1. check if layer has a presentation
      const presentation = await db.layer_presentations.findFirst({
        where: { vector_layer_id: layer.vector_layer_id },
      })
      if (!presentation) {
        // 2. if not, create one
        const data = createLayerPresentation({
          vector_layer_id: layer.vector_layer_id,
          active: true,
        })
        db.layer_presentations.create({ data })
      } else {
        // 3. if yes, update it
        db.layer_presentations.update({
          where: { layer_presentation_id: presentation.layer_presentation_id },
          data: { active: true },
        })
      }
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
                checked={
                  !!layerPresentations.find(
                    (lp) =>
                      lp.vector_layer_id === l.vector_layer_id && lp.active,
                  )
                }
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
