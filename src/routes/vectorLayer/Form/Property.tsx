import { useCallback, useMemo, memo } from 'react'
import { useParams } from 'react-router-dom'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { DropdownFieldOptions } from '../../../components/shared/DropdownFieldOptions.tsx'
import { TextField } from '../../../components/shared/TextField.tsx'
import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { upsertVectorLayerDisplaysForVectorLayer } from './upsertVectorLayerDisplaysForVectorLayer.ts'

export const Property = memo(({ vectorLayer }) => {
  const { project_id, vector_layer_id } = useParams()

  const table = vectorLayer?.own_table
  const level = vectorLayer?.own_table_level

  const db = usePGlite()
  // get fields of table
  const result = useLiveIncrementalQuery(
    `
    SELECT 
      field_id, 
      field_label, 
      name 
    FROM fields 
    WHERE 
      table_name = $1 
      AND level = $2 
      AND project_id = $3 
    ORDER BY sort_index ASC, label ASC`,
    [table, level, project_id],
    'field_id',
  )
  const fields = useMemo(() => result?.rows ?? [], [result])
  const options = useMemo(
    () =>
      fields.map((field) => ({
        label: field.field_label ?? field.name,
        value: field.name,
      })),
    [fields],
  )

  // TODO: get fields of wfs
  const onChange = useCallback(
    async (e, data) => {
      const { value } = getValueFromChange(e, data)
      await db.query(
        `UPDATE vector_layers SET display_by_property = $1 WHERE vector_layer_id = $2`,
        [value, vector_layer_id],
      )
      // set vector_layer_displays
      upsertVectorLayerDisplaysForVectorLayer({
        db,
        vectorLayerId: vector_layer_id,
      })
    },
    [db, vector_layer_id],
  )

  // console.log('VectorLayerForm.PropertyField, fields:', fields)

  if (!fields.length) {
    return (
      <TextField
        label="Display by"
        placeholder="no fields found"
        hint="For every unique value of this field, a map display will be generated"
        disabled
      />
    )
  }

  return (
    <DropdownFieldOptions
      label="Display by"
      name="display_by_property"
      value={vectorLayer.display_by_property}
      onChange={onChange}
      options={options}
      validationMessage="For every unique value of this field, a map display will be generated"
    />
  )
})
