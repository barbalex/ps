import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { Checkbox, Label, Slider, Field } from '@fluentui/react-components'

import { useElectric } from '../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { createNotification } from '../../../../modules/createRows.ts'

const layerListStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
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

  const onChangeActive = useCallback(
    (layer) => {
      // update layer_presentations, set active = false
      const presentation = layer.layer_presentations?.[0]
      if (presentation) {
        return db.layer_presentations.update({
          where: { layer_presentation_id: presentation.layer_presentation_id },
          data: { active: false },
        })
      }
      // if no presentation exists, create notification
      const data = createNotification({
        title: 'Layer presentation not found',
        type: 'warning',
      })
      db.notifications.create({ data })
    },
    [db],
  )
  const onChangeOpacity = useCallback(
    (layerPresentation, value) => {
      console.log('onChangeOpacity', { layerPresentation, value })
      db.layer_presentations.update({
        where: {
          layer_presentation_id: layerPresentation.layer_presentation_id,
        },
        data: { opacity_percent: value },
      })
    },
    [db.layer_presentations],
  )

  return (
    <ErrorBoundary>
      <h2>Active</h2>
      <div style={layerListStyle}>
        {activeLayers.length ? (
          activeLayers?.map((l) => {
            const layerPresentation = l.layer_presentations?.[0]
            console.log('Active', { l, layerPresentation })

            return (
              <div key={l.tile_layer_id ?? l.vector_layer_id}>
                <Checkbox
                  size="large"
                  label={l.label}
                  checked={layerPresentation.active}
                  onChange={() => onChangeActive(l)}
                />
                <Field label="Opacity">
                  <Slider
                    min={0}
                    max={100}
                    value={layerPresentation.opacity_percent}
                    onChange={(_, data) => {
                      console.log('onChangeOpacity', {
                        _,
                        data,
                        layerPresentation,
                      })
                      onChangeOpacity(layerPresentation, data.value)
                    }}
                  />
                </Field>
              </div>
            )
          })
        ) : (
          <p>No active layers</p>
        )}
      </div>
    </ErrorBoundary>
  )
})
