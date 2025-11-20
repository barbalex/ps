import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { createNotification } from '../../../../modules/createRows.ts'
import { SliderField } from '../../../shared/SliderField.tsx'
import { SwitchField } from '../../../shared/SwitchField.tsx'
import { TextField } from '../../../shared/TextField.tsx'
import { getValueFromChange } from '../../../../modules/getValueFromChange.ts'
import { Loading } from '../../../shared/Loading.tsx'

const containerStyle = {
  padding: '1rem',
}

export const LayerPresentationForm = ({ layer }) => {
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT * FROM layer_presentations WHERE layer_presentation_id = $1`,
    [layer.layer_presentation_id],
  )

  const row = res?.rows?.[0]

  const onChange = (e, data) => {
    if (!row?.layer_presentation_id) {
      // if no presentation exists, create notification
      createNotification({
        title: 'Layer presentation not found',
        type: 'warning',
        db,
      })
    }
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    db.query(
      `UPDATE layer_presentations SET ${name} = $1 WHERE layer_presentation_id = $2`,
      [value, row?.layer_presentation_id],
    )
  }

  if (!row) return <Loading />

  // TODO: drag and drop items by dragging the drag icon
  // https://atlassian.design/components/pragmatic-drag-and-drop/core-package
  return (
    <ErrorBoundary>
      <div
        style={containerStyle}
        className="form-container-embedded"
      >
        <SliderField
          label="Opacity (%)"
          name="opacity_percent"
          min={0}
          max={100}
          value={row.opacity_percent}
          onChange={onChange}
        />
        {layer.wms_layer_id && (
          <>
            <SwitchField
              label="Transparent"
              name="transparent"
              value={row.transparent}
              onChange={onChange}
            />
            <SwitchField
              label="Grayscale"
              name="grayscale"
              value={row.grayscale}
              onChange={onChange}
            />
          </>
        )}
        <TextField
          label="Max Zoom"
          name="max_zoom"
          value={row.max_zoom ?? ''}
          onChange={onChange}
          type="number"
          max={19}
          min={0}
          validationMessage="A number between 0 and 19"
        />
        <TextField
          label="Min Zoom"
          name="min_zoom"
          value={row.min_zoom ?? ''}
          onChange={onChange}
          type="number"
          max={19}
          min={0}
          validationMessage="A number between 0 and 19"
        />
      </div>
    </ErrorBoundary>
  )
}
