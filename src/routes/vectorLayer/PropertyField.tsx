import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import {
  Fields as Field,
  Vector_layers as VectorLayer,
} from '../../generated/client'
import { DropdownFieldOptions } from '../../components/shared/DropdownFieldOptions'
import { getValueFromChange } from '../../modules/getValueFromChange'

type Props = {
  vectorLayer: VectorLayer
}

type FieldResults = {
  results: Field[]
  error: Error
}

export const PropertyField = memo(({ vectorLayer }: Props) => {
  const { project_id, vector_layer_id } = useParams()

  // get table and level from vector_layer.type
  // table is vectorLayer.type without last character
  const table = vectorLayer?.type?.slice(0, -1) ?? null
  // level is last character of vectorLayer.type
  const level = parseInt(vectorLayer?.type?.slice(-1)) ?? null

  const { db } = useElectric()!
  // get fields of table
  const { results: fields = [], error: errorFields }: FieldResults =
    useLiveQuery(
      db.fields.liveMany({
        where: { table_name: table, level, project_id, deleted: false },
      }),
    )
  const options = useMemo(
    () =>
      fields.map((field) => ({
        label: field.field_label ?? field.name,
        value: field.field_label ?? field.name,
      })),
    [fields],
  )

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.vector_layers.update({
        where: { vector_layer_id },
        data: { [name]: value },
      })
      // TODO: set vector_layer_displays
    },
    [db.vector_layers, vector_layer_id],
  )

  console.log('hello propertyField', {
    table,
    level,
    errorFields,
    vectorLayer,
    project_id,
    vector_layer_id,
    fields,
  })

  if (!fields.length) return null

  return (
    <DropdownFieldOptions
      label="Display by"
      name="display_by_property_field"
      value={vectorLayer.display_by_property_field}
      onChange={onChange}
      options={options}
      validationMessage="For every unique value of this field, a map display will be generated."
    />
  )
})
