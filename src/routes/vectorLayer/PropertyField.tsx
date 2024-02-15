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

export const PropertyField = ({ vectorLayer }: Props) => {
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

  // show a dropdown listing fields
  return (
    <DropdownFieldOptions
      label="Property Field"
      name="display_by_property_field"
      value={vectorLayer.display_by_property_field}
      onChange={(e, data) => {
        const { name, value } = getValueFromChange(e, data)
        db.vector_layers.update({
          where: { vector_layer_id },
          data: { [name]: value },
        })
      }}
      options={fields.map((field) => ({
        label: field.field_label ?? field.name,
        value: field.field_label ?? field.name,
      }))}
    />
  )
}
