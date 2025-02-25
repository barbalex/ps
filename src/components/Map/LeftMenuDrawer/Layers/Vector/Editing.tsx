import { memo, useCallback } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { getValueFromChange } from '../../../../../modules/getValueFromChange.ts'
import { Component as VectorLayerForm } from '../../../../../routes/vectorLayer/Form/index.tsx'

// inset form and give it green shadow
const formContainerStyle = {
  padding: '1em',
}

export const VectorLayerEditing = memo(({ layer }) => {
  const db = usePGlite()

  const onChange = useCallback(
    async (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      try {
        await db.query(
          `UPDATE vector_layers SET ${name} = $1 WHERE vector_layer_id = $2`,
          [value, layer.vector_layer_id],
        )
      } catch (error) {
        console.log('hello VectorLayer, onChange, error:', error)
      }
      return
    },
    [db, layer.vector_layer_id],
  )

  return (
    <ErrorBoundary>
      <div
        style={formContainerStyle}
        className="form-container-embedded"
      >
        <VectorLayerForm
          onChange={onChange}
          row={layer}
        />
      </div>
    </ErrorBoundary>
  )
})
