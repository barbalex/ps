import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { Vector_layers as VectorLayer } from '../../../generated/client/index.ts'
import { DropdownFieldOptions } from '../../../components/shared/DropdownFieldOptions.tsx'
import { TextField } from '../../../components/shared/TextField.tsx'
import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { upsertVectorLayerDisplaysForVectorLayer } from './upsertVectorLayerDisplaysForVectorLayer.ts'

interface Props {
  vectorLayer: VectorLayer
}

export const Property = memo(({ vectorLayer }: Props) => {
  const { project_id, vector_layer_id } = useParams()

  const table = vectorLayer?.own_table
  const level = vectorLayer?.own_table_level

  const db = usePGlite()
  // get fields of table
  const { results: fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { table_name: table, level, project_id },
      orderBy: [{ sort_index: 'asc' }, { label: 'asc' }],
    }),
  )
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
      await db.vector_layers.update({
        where: { vector_layer_id },
        data: { display_by_property: value },
      })
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
