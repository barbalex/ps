import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../../ElectricProvider.tsx'
import { Vector_layers as VectorLayer } from '../../../generated/client/index.ts'
import { DropdownFieldOptions } from '../../../components/shared/DropdownFieldOptions.tsx'
import { TextField } from '../../../components/shared/TextField.tsx'
import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { upsertVectorLayerDisplaysForVectorLayer } from '../../../modules/upsertVectorLayerDisplaysForVectorLayer.ts'

interface Props {
  vectorLayer: VectorLayer
}

export const Property = memo(({ vectorLayer }: Props) => {
  const { project_id, vector_layer_id } = useParams()

  // get table and level from vector_layer.type
  // table is vectorLayer.type without last character
  const table = vectorLayer?.type?.slice(0, -1) ?? null
  // level is last character of vectorLayer.type
  const level = parseInt(vectorLayer?.type?.slice(-1)) ?? null

  const { db } = useElectric()!
  // get fields of table
  const { results: fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { table_name: table, level, project_id },
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
      upsertVectorLayerDisplaysForVectorLayer({ db, vector_layer_id })
    },
    [db, vector_layer_id],
  )

  console.log('VectorLayerForm.PropertyField, fields:', fields)

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
