import { Vector_layers as VectorLayer, Electric } from '../generated/client'
import { createVectorLayerDisplay } from './createRows'

type Props = {
  vector_layer_id: string
  db: Electric
}

export const upsertVectorLayerDisplaysForVectorLayer = async ({
  db,
  vector_layer_id,
}: Props) => {
  console.log('hello upsertVectorLayerDisplaysForVectorLayer', {
    db,
    vector_layer_id,
  })
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

  if (!displayByPropertyField) {
    // create single display
    const existingVectorLayerDisplay = await db.vector_layer_displays.findFirst(
      {
        where: {
          vector_layer_id,
          deleted: false,
        },
      },
    )
    // leave existing VLD unchanged
    if (existingVectorLayerDisplay) return

    // remove all other displays
    await db.vector_layer_displays.deleteMany({
      where: { vector_layer_id, deleted: false },
    })

    const newVLD = createVectorLayerDisplay({ vector_layer_id })
    return await db.vector_layer_displays.create({ data: newVLD })
  }

  // get field of displayByPropertyField
  const field = await db.fields.findFirst({
    where: {
      name: displayByPropertyField,
      table_name: table,
      level,
      project_id: vectorLayer.project_id,
      deleted: false,
    },
  })

  if (!field) {
    throw new Error(
      `field ${displayByPropertyField} not found in table ${table} level ${level}`,
    )
  }

  // if this field has a list_id, get the list
  if (field?.list_id) {
    const list = await db.lists.findUnique({
      where: { list_id: field.list_id },
    })
    if (!list) {
      throw new Error(`list_id ${field.list_id} not found`)
    }
    const listValues = await db.list_values.findMany({
      where: { list_id: field.list_id, deleted: false },
    })
    // remove all displays not in list
    await db.vector_layer_displays.deleteMany({
      where: {
        vector_layer_id,
        display_property_value: { notIn: listValues.map((v) => v.value) },
      },
    })
    // above does not remove null values...
    await db.vector_layer_displays.deleteMany({
      where: {
        vector_layer_id,
        display_property_value: null,
      },
    })
    // upsert displays in list
    for (const listValue of listValues) {
      const existingVectorLayerDisplay =
        await db.vector_layer_displays.findFirst({
          where: {
            vector_layer_id,
            display_property_value: listValue.value,
            deleted: false,
          },
        })
      // leave existing VLD unchanged
      if (existingVectorLayerDisplay) return

      const newVLD = createVectorLayerDisplay({
        vector_layer_id,
        display_property_value: listValue.value,
      })
      await db.vector_layer_displays.create({ data: newVLD })
    }
    return
  }

  // if this field has no list_id, get the unique values of this field in the table
  const where = { project_id: vectorLayer.project_id, deleted: false }
  if (table === 'places') {
    if (level === 1) {
      where.parent_id = null
    } else {
      where.parent_id = { not: null }
    }
  }
  const tableRows = await db[table]?.findMany?.({
    where,
    distinct: [displayByPropertyField],
  })
  const distinctValues = tableRows.map((row) => row[displayByPropertyField])

  for (const value of distinctValues) {
    const existingVectorLayerDisplay = await db.vector_layer_displays.findFirst(
      {
        where: {
          vector_layer_id,
          display_property_value: value,
          deleted: false,
        },
      },
    )
    // leave existing VLD unchanged
    if (existingVectorLayerDisplay) return

    const newVLD = createVectorLayerDisplay({
      vector_layer_id,
      display_property_value: value,
    })
    await db.vector_layer_displays.create({ data: newVLD })
  }
  return
}
