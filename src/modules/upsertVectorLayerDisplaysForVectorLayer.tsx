import { Vector_layers as VectorLayer, Electric } from '../generated/client'

type Props = {
  vector_layer_id: string
  db: Electric
}

export const upsertVectorLayerDisplaysForVectorLayer = async ({
  db,
  vector_layer_id,
}: Props) => {
  const vectorLayer: VectorLayer = await db.vector_layers.findUnique({
    where: { vector_layer_id },
  })
  if (!vectorLayer) {
    throw new Error(`vector_layer_id ${vector_layer_id} not found`)
  }
  if (!vectorLayer.type) {
    throw new Error(`vector_layer_id ${vector_layer_id} has no type`)
  }
  // TODO: do this for wfs and upload
  if ([`wfs`, `upload`].includes(vectorLayer.type)) {
    throw new Error(
      `creating vector_layer_displays for wfs and upload not implemented`,
    )
  }
  // get table and level from vector_layer.type
  // table is vectorLayer.type without last character
  const table = vectorLayer.type.slice(0, -1)
  // level is last character of vectorLayer.type
  const level = parseInt(vectorLayer.type.slice(-1))
  const displayByPropertyField = vectorLayer?.display_by_property_field ?? false

  // get fields of table
  const fields = await db.fields.findMany({
    where: {
      table_name: table,
      level,
      project_id: vectorLayer.project_id,
      deleted: false,
    },
  })

  // get vector_layer_displays of vector_layer
  const vectorLayerDisplays = await db.vector_layer_displays.findMany({
    where: { vector_layer_id, deleted: false },
  })

  // upsert vector_layer_displays
  for (const field of fields) {
    const vectorLayerDisplay = vectorLayerDisplays.find(
      (vld) => vld.field_name === field.name,
    )
    const value = vectorLayerDisplay?.value ?? field.field_label ?? field.name
    await db.vector_layer_displays.upsert({
      create: {
        vector_layer_display_id: `${vector_layer_id}/${field.name}`,
        vector_layer_id,
        field_name: field.name,
        value,
      },
      update: {
        vector_layer_id,
        field_name: field.name,
        value,
      },
      where: { vector_layer_display_id: `${vector_layer_id}/${field.name}` },
    })
  }
}
