import { memo, useCallback } from 'react'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { getValueFromChange } from '../../../../../modules/getValueFromChange.ts'
import { Component as VectorLayerForm } from '../../../../../routes/vectorLayer/Form/index.tsx'

// inset form and give it green shadow
const formContainerStyle = {
  padding: '1em',
}

export const VectorLayerEditing = memo(({ layer }) => {
  const { db } = useElectric()!

  const onChange = useCallback(
    async (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      try {
        await db.vector_layers.update({
          where: { vector_layer_id: layer.vector_layer_id },
          data: { [name]: value },
        })
      } catch (error) {
        console.log('hello VectorLayer, onChange, error:', error)
      }
      return
    },
    [db.vector_layers, layer.vector_layer_id],
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
