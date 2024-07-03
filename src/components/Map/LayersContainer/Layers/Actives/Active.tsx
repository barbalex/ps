import { memo, useCallback } from 'react'
import { Checkbox } from '@fluentui/react-components'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createNotification } from '../../../../../modules/createRows.ts'
import { SliderField } from '../../../../shared/SliderField.tsx'

const containerStyle = {
  borderTop: '1px solid rgba(55, 118, 28, 0.5)',
  borderBottom: '1px solid rgba(55, 118, 28, 0.5)',
  paddingLeft: 10,
  paddingRight: 10,
  paddingBottom: 10,
}

export const ActiveLayer = memo(({ layer }) => {
  const { db } = useElectric()!

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

  const layerPresentation = layer.layer_presentations?.[0]

  return (
    <ErrorBoundary>
      <div style={containerStyle}>
        <Checkbox
          size="large"
          label={layer.label}
          checked={layerPresentation.active}
          onChange={() => onChangeActive(layer)}
        />
        <SliderField
          label="Opacity (%)"
          min={0}
          max={100}
          value={layerPresentation.opacity_percent}
          onChange={(_, data) => onChangeOpacity(layerPresentation, data.value)}
        />
      </div>
    </ErrorBoundary>
  )
})
