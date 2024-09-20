import { memo, useCallback } from 'react'

import { useElectric } from '../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { createNotification } from '../../../../modules/createRows.ts'
import { SliderField } from '../../../shared/SliderField.tsx'
import { SwitchField } from '../../../shared/SwitchField.tsx'
import { TextField } from '../../../shared/TextField.tsx'
import {
  Vector_layers as VectorLayer,
  Wms_layers as WmsLayer,
} from '../../../../generated/client/index.ts'
import { getValueFromChange } from '../../../../modules/getValueFromChange.ts'

type Props = {
  layer: VectorLayer | WmsLayer
}

export const LayerPresentationForm = memo(({ layer }: Props) => {
  const { db } = useElectric()!

  const layerPresentation = layer.layer_presentations?.[0]

  const onChange = useCallback(
    (e, data) => {
      if (!layerPresentation) {
        // if no presentation exists, create notification
        const data = createNotification({
          title: 'Layer presentation not found',
          type: 'warning',
        })
        return db.notifications.create({ data })
      }
      const { name, value } = getValueFromChange(e, data)
      db.layer_presentations.update({
        where: {
          layer_presentation_id: layerPresentation.layer_presentation_id,
        },
        data: { [name]: value },
      })
    },
    [db.layer_presentations, db.notifications, layerPresentation],
  )

  // TODO: drag and drop items by dragging the drag icon
  // https://atlassian.design/components/pragmatic-drag-and-drop/core-package
  return (
    <ErrorBoundary>
      <SliderField
        label="Opacity (%)"
        name="opacity_percent"
        min={0}
        max={100}
        value={layerPresentation.opacity_percent}
        onChange={onChange}
      />
      {layer.wms_layer_id && (
        <>
          <SwitchField
            label="Transparent"
            name="transparent"
            value={layerPresentation.transparent}
            onChange={onChange}
          />
          <SwitchField
            label="Grayscale"
            name="grayscale"
            value={layerPresentation.grayscale}
            onChange={onChange}
          />
        </>
      )}
      <TextField
        label="Max Zoom"
        name="max_zoom"
        value={layerPresentation.max_zoom ?? ''}
        onChange={onChange}
        type="number"
        max={19}
        min={0}
        validationMessage="A number between 0 and 19"
      />
      <TextField
        label="Min Zoom"
        name="min_zoom"
        value={layerPresentation.min_zoom ?? ''}
        onChange={onChange}
        type="number"
        max={19}
        min={0}
        validationMessage="A number between 0 and 19"
      />
    </ErrorBoundary>
  )
})
