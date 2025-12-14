import { Dropdown, Field, Option } from '@fluentui/react-components'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { addOperationAtom } from '../../../store.ts'

export const LayersDropdown = ({ vectorLayer, validationMessage }) => {
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const res = useLiveQuery(
    `
    SELECT 
      wfs_service_layer_id, 
      name, 
      label 
    FROM wfs_service_layers 
    WHERE wfs_service_id = $1 
    ORDER BY label`,
    [vectorLayer.wfs_service_id],
  )
  const options = (res?.rows ?? []).map(({ name, label }) => ({
    value: name,
    label,
  }))
  const selectedOptions = options.filter(
    (option) => option.value === vectorLayer.wfs_service_layer_name,
  )

  const onOptionSelect = async (e, data) => {
    await db.query(
      `UPDATE vector_layers SET wfs_service_layer_name = $1, label = $2 WHERE vector_layer_id = $3`,
      [data.optionValue, data.optionText, vectorLayer.vector_layer_id],
    )
    addOperation({
      table: 'vector_layers',
      rowIdName: 'vector_layer_id',
      rowId: vectorLayer.vector_layer_id,
      operation: 'update',
      draft: {
        wfs_service_layer_name: data.optionValue,
        label: data.optionText,
      },
      prev: { ...vectorLayer },
    })
  }

  const labelWithCount = options?.length ? `Layer (${options.length})` : 'Layer'

  return (
    <Field
      label={labelWithCount}
      validationMessage={validationMessage}
      validationState="none"
    >
      <Dropdown
        name="wfs_service_layer_name"
        value={selectedOptions?.[0]?.label ?? ''}
        selectedOptions={selectedOptions}
        onOptionSelect={onOptionSelect}
        appearance="underline"
        clearable
      >
        {options.map((option) => {
          return (
            <Option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </Option>
          )
        })}
      </Dropdown>
    </Field>
  )
}
