import { usePGlite } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { getValueFromChange } from '../../../../../modules/getValueFromChange.ts'
import { WmsLayerForm } from '../../../../../formsAndLists/wmsLayer/Form/index.tsx'

// inset form and give it green shadow
const formContainerStyle = {
  padding: '1em',
}

export const WmsLayerEditing = ({ layer: row }) => {
  const db = usePGlite()

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE wms_layers SET ${name} = $1 WHERE wms_layer_id = $2`,
        [value, row.wms_layer_id],
      )
    } catch (error) {
      console.log('hello WmsLayer, onChange, error:', error)
    }
  }

  return (
    <ErrorBoundary>
      <div
        style={formContainerStyle}
        className="form-container-embedded"
      >
        <WmsLayerForm
          onChange={onChange}
          row={row}
        />
      </div>
    </ErrorBoundary>
  )
}
