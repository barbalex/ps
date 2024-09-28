import { memo, useCallback } from 'react'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { getValueFromChange } from '../../../../../modules/getValueFromChange.ts'
import { Component as WmsLayerForm } from '../../../../../routes/wmsLayer/Form/index.tsx'

// inset form and give it green shadow
const formContainerStyle = {
  padding: '1em',
}

export const WmsLayerEditing = memo(({ layer }) => {
  const { db } = useElectric()!

  const onChange = useCallback(
    async (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      try {
        await db.wms_layers.update({
          where: { wms_layer_id: layer.wms_layer_id },
          data: { [name]: value },
        })
      } catch (error) {
        console.log('hello WmsLayer, onChange, error:', error)
      }
      return
    },
    [db.wms_layers, layer.wms_layer_id],
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
