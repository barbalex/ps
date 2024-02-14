import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import {
  Fields as Field,
  Vector_layer_displays as VectorLayerDisplay,
  Vector_layers as VectorLayer,
} from '../../generated/client'

type Props = {
  vectorLayerDisplay: VectorLayerDisplay
}

type VLResults = {
  results: VectorLayer
  error: Error
}

type FieldResults = {
  results: Field[]
  error: Error
}
type VLDResults = {
  results: VectorLayerDisplay[]
  error: Error
}

export const PropertyField = ({ vectorLayerDisplay }: Props) => {
  const { project_id, vector_layer_id, vector_layer_display_id } = useParams()

  const { db } = useElectric()!
  // get table and level from vector_layer.type
  const { results: vectorLayer, error: errorVL }: VLResults = useLiveQuery(
    db.vector_layers.liveUnique({
      where: { vector_layer_id },
    }),
  )
  // table is vectorLayer.type without last character
  const table = vectorLayer?.type?.slice(0, -1) ?? null
  // level is last character of vectorLayer.type
  const level = parseInt(vectorLayer?.type?.slice(-1)) ?? null

  // get fields of table
  const { results: fields = [], error: errorFields }: FieldResults =
    useLiveQuery(
      db.fields.liveMany({
        where: { table_name: table, level, project_id, deleted: false },
      }),
    )

  // also need all other vector_layer_displays of this vector_layer with set propery_field
  const {
    results: otherVectorLayerDisplays = [],
    error: errorVLD,
  }: VLDResults = useLiveQuery(
    db.vector_layer_displays.liveMany({
      where: {
        vector_layer_display_id: {
          not: vector_layer_display_id,
        },
        vector_layer_id,
        deleted: false,
        property_field: { not: null },
      },
    }),
  )

  // extract all fields not yet used as property_field
  const propertyFields = fields.filter(
    (field) =>
      !otherVectorLayerDisplays.find(
        (vld) => vld.property_field === field.field_id,
      ),
  )

  console.log('hello propertyField', {
    db,
    table,
    level,
    errorVL,
    errorFields,
    errorVLD,
    vectorLayer,
    vectorLayerDisplay,
    project_id,
    vector_layer_id,
    vector_layer_display_id,
    propertyFields,
    vectorLayerDisplays: otherVectorLayerDisplays,
    fields,
  })

  return (
    <div>
      <h3>PropertyField</h3>
    </div>
  )
}
