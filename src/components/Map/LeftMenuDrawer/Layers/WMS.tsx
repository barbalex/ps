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

export const WmsLayers = memo(() => {
  const { project_id } = useParams()
  // const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  // 1. list all layers (own, wms, vector)
  const where = project_id ? { project_id } : {}
  // TODO: when including layer_presentations, no results are returned
  // unlike with vector_layer_displays. Maybe because no layer_presentations exist?
  const { results: wmsLayers = [] } = useLiveQuery(
    db.wms_layers.liveMany({ where }),
  )

  // fetch all layer_presentations for the vector layers
  const { results: layerPresentations = [] } = useLiveQuery(
    db.layer_presentations.liveMany({
      where: {
        wms_layer_id: { in: wmsLayers.map((l) => l.wms_layer_id) },
      },
    }),
  )
  // 2. when one is set active, add layer_presentations for it

  const wms = wmsLayers.filter(
    (l) =>
      !layerPresentations.some(
        (lp) => lp.wms_layer_id === l.wms_layer_id && lp.active,
      ),
  )

  const onChange = useCallback(
    async (layer) => {
      // 1. check if layer has a presentation
      const presentation = await db.layer_presentations.findFirst({
        where: { wms_layer_id: layer.wms_layer_id },
      })
      // 2. if not, create one
      if (!presentation) {
        const data = createLayerPresentation({
          wms_layer_id: layer.wms_layer_id,
          active: true,
        })
        db.layer_presentations.create({ data })
      }
      // 3. if yes, update it
      else {
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
        <h2 style={titleStyle}>WMS</h2>
        <div style={layerListStyle}>
          {wms.length ? (
            wms?.map((l) => (
              <Checkbox
                key={l.wms_layer_id}
                size="large"
                label={l.label}
                // checked if layer has an active presentation
                checked={
                  !!layerPresentations.find(
                    (lp) => lp.wms_layer_id === l.wms_layer_id && lp.active,
                  )
                }
                onChange={() => onChange(l)}
              />
            ))
          ) : (
            <p style={noneStyle}>No inactive WMS Layers</p>
          )}
        </div>
      </section>
    </ErrorBoundary>
  )
})
