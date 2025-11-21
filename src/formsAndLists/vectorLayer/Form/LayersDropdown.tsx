import { Dropdown, Field, Option } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

export const LayersDropdown = ({ vectorLayer, validationMessage }) => {
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `
    SELECT 
      wfs_service_layer_id, 
      name, 
      label 
    FROM wfs_service_layers 
    WHERE wfs_service_id = $1 
    ORDER BY label`,
    [vectorLayer.wfs_service_id],
    'wfs_service_layer_id',
  )
  const options = (res?.rows ?? []).map(({ name, label }) => ({
    value: name,
    label,
  }))
  const selectedOptions = options.filter(
    (option) => option.value === vectorLayer.wfs_service_layer_name,
  )

  const onOptionSelect = async (e, data) => {
    db.query(
      `UPDATE vector_layers SET wfs_service_layer_name = $1, label = $2 WHERE vector_layer_id = $3`,
      [data.optionValue, data.optionText, vectorLayer.vector_layer_id],
    )
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
