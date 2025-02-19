import { memo, useCallback, useMemo } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { createNotification } from '../../../../modules/createRows.ts'
import { SliderField } from '../../../shared/SliderField.tsx'
import { SwitchField } from '../../../shared/SwitchField.tsx'
import { TextField } from '../../../shared/TextField.tsx'
import { getValueFromChange } from '../../../../modules/getValueFromChange.ts'

const containerStyle = {
  padding: '1rem',
}

export const LayerPresentationForm = memo(({ layer }) => {
  const db = usePGlite()

  const layerPresentation = useMemo(
    () => layer.layer_presentations?.[0] ?? {},
    [layer.layer_presentations],
  )

  const onChange = useCallback(
    (e, data) => {
      if (!layerPresentation) {
        // if no presentation exists, create notification
        createNotification({
          title: 'Layer presentation not found',
          type: 'warning',
          db,
        })
      }
      const { name, value } = getValueFromChange(e, data)
      db.query(
        `UPDATE layer_presentations SET ${name} = $1 WHERE layer_presentation_id = $2`,
        [value, layerPresentation.layer_presentation_id],
      )
    },
    [db, layerPresentation],
  )

  // TODO: drag and drop items by dragging the drag icon
  // https://atlassian.design/components/pragmatic-drag-and-drop/core-package
  return (
    <ErrorBoundary>
      <div style={containerStyle} className="form-container-embedded">
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
      </div>
    </ErrorBoundary>
  )
})
