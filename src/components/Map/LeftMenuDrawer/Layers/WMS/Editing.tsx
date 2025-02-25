import { memo, useCallback } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { getValueFromChange } from '../../../../../modules/getValueFromChange.ts'
import { Component as WmsLayerForm } from '../../../../../routes/wmsLayer/Form/index.tsx'

// inset form and give it green shadow
const formContainerStyle = {
  padding: '1em',
}

export const WmsLayerEditing = memo(({ layer }) => {
  const db = usePGlite()

  const onChange = useCallback(
    async (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      try {
        await db.query(
          `UPDATE wms_layers SET ${name} = $1 WHERE wms_layer_id = $2`,
          [value, layer.wms_layer_id],
        )
      } catch (error) {
        console.log('hello WmsLayer, onChange, error:', error)
      }
    },
    [db, layer.wms_layer_id],
  )

  return (
    <ErrorBoundary>
      <div
        style={formContainerStyle}
        className="form-container-embedded"
      >
        <WmsLayerForm
          onChange={onChange}
          wmsLayer={layer}
        />
      </div>
    </ErrorBoundary>
  )
})
