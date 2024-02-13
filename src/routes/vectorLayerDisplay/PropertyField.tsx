import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import {
  Fields as Field,
  Vector_layer_displays as VectorLayerDisplay,
} from '../../generated/client'

type Props = {
  table: string
  vectorLayerDisplay: VectorLayerDisplay
}

type FieldResults = {
  results: Field[]
}
type VLResults = {
  results: VectorLayerDisplay[]
}

export const PropertyField = ({ table, vectorLayerDisplay }) => {
  const { project_id } = useParams()

  const { db } = useElectric()!
  // get fields of table
  const { results: fields = [] }: FieldResults = useLiveQuery(
    db.fields.findMany({
      where: { table_name: table, project_id, deleted: false },
    }),
  )

  // also need all other vector_layer_displays of this vector_layer with set propery_field
  const { results: vectorLayerDisplays = [] }: VLResults = useLiveQuery(
    db.vector_layer_displays.findMany({
      where: {
        vector_layer_display_id: {
          not: vectorLayerDisplay.vector_layer_display_id,
        },
        vector_layer_id: vectorLayerDisplay.vector_layer_id,
        deleted: false,
        property_field: { not: null },
      },
    }),
  )

  // extract all fields not yet used as property_field
  const propertyFields = fields.filter(
    (field) =>
      !vectorLayerDisplays.find(
        (vld) => vld.property_field === field.field_id,
      ),
  )

  return (
    <div>
      <h1>PropertyField</h1>
    </div>
  )
}
