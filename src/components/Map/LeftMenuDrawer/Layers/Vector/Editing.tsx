import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import type { ComponentType } from 'react'

import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { getValueFromChange } from '../../../../../modules/getValueFromChange.ts'
import { VectorLayerForm as VectorLayerFormUntyped } from '../../../../../formsAndLists/vectorLayer/Form/index.tsx'
import { addOperationAtom } from '../../../../../store.ts'
import type VectorLayers from '../../../../../models/public/VectorLayers.ts'
import styles from './Editing.module.css'

export const VectorLayerEditing = ({ layer: row }: { layer: VectorLayers }) => {
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const onChange = async (
    e: Parameters<typeof getValueFromChange>[0],
    data: Parameters<typeof getValueFromChange>[1],
  ) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if ((row as unknown as Record<string, unknown>)[name] === value) return

    try {
      await db.query(
        `UPDATE vector_layers SET ${name} = $1 WHERE vector_layer_id = $2`,
        [value, row.vector_layer_id],
      )
    } catch (error) {
      console.log('hello VectorLayer, onChange, error:', error)
    }
    // add task to update server and rollback PGlite in case of error
    addOperation({
      table: 'vector_layers',
      rowIdName: 'vector_layer_id',
      rowId: row.vector_layer_id,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })

    return
  }

  // VectorLayerForm's props are not typed yet
  const VectorLayerForm = VectorLayerFormUntyped as unknown as ComponentType<{
    onChange: typeof onChange
    row: VectorLayers
  }>

  return (
    <ErrorBoundary>
      <div className={`${styles.formContainer} form-container-embedded`}>
        <VectorLayerForm onChange={onChange} row={row} />
      </div>
    </ErrorBoundary>
  )
}
