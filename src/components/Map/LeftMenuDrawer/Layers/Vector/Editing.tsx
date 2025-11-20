import { usePGlite } from '@electric-sql/pglite-react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { getValueFromChange } from '../../../../../modules/getValueFromChange.ts'
import { VectorLayerForm } from '../../../../../formsAndLists/vectorLayer/Form/index.tsx'

// inset form and give it green shadow
const formContainerStyle = {
  padding: '1em',
}

export const VectorLayerEditing = ({ layer: row }) => {
  const db = usePGlite()

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE vector_layers SET ${name} = $1 WHERE vector_layer_id = $2`,
        [value, row.vector_layer_id],
      )
    } catch (error) {
      console.log('hello VectorLayer, onChange, error:', error)
    }
    return
  }

  return (
    <ErrorBoundary>
      <div
        style={formContainerStyle}
        className="form-container-embedded"
      >
        <VectorLayerForm
          onChange={onChange}
          row={row}
        />
      </div>
    </ErrorBoundary>
  )
}
