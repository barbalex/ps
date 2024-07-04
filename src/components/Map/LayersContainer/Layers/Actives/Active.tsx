import { memo, useCallback } from 'react'
import { Checkbox } from '@fluentui/react-components'
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from '@fluentui/react-components'
import { MdDragIndicator } from 'react-icons/md'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createNotification } from '../../../../../modules/createRows.ts'
import { SliderField } from '../../../../shared/SliderField.tsx'
import {
  Vector_layers as VectorLayer,
  Tile_layers as TileLayer,
} from '../../../../../generated/client/index.ts'

import './active.css'

type Props = {
  layer: VectorLayer | TileLayer
  index: boolean
}

const containerStyle = {
  borderTop: '1px solid rgba(55, 118, 28, 0.5)',
}
const panelStyle = {
  paddingBottom: 8,
}
const dragIconStyle = { fontSize: 'x-large', color: 'rgba(55, 118, 28, 0.6)' }

export const ActiveLayer = memo(({ layer, isLast }: Props) => {
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
      <AccordionItem value={layer.vector_layer_id ?? layer.tile_layer_id}>
        <div
          style={{
            ...containerStyle,
            ...(isLast
              ? { borderBottom: '1px solid rgba(55, 118, 28, 0.5)' }
              : {}),
          }}
        >
          <AccordionHeader expandIconPosition="end" size="extra-large">
            <MdDragIndicator style={dragIconStyle} />
            <Checkbox
              size="large"
              label={layer.label}
              checked={layerPresentation.active}
              onChange={() => onChangeActive(layer)}
            />
          </AccordionHeader>
          <AccordionPanel style={panelStyle}>
            <SliderField
              label="Opacity (%)"
              min={0}
              max={100}
              value={layerPresentation.opacity_percent}
              onChange={(_, data) =>
                onChangeOpacity(layerPresentation, data.value)
              }
            />
          </AccordionPanel>
        </div>
      </AccordionItem>
    </ErrorBoundary>
  )
})
