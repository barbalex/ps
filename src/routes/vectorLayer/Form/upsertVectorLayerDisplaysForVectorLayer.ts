import {
  Vector_layers as VectorLayer,
  Electric,
} from '../../../generated/client/index.ts'
import { createVectorLayerDisplay } from '../../../modules/createRows.ts'
import { chunkArrayWithMinSize } from '../../../modules/chunkArrayWithMinSize.ts'

interface Props {
  vectorLayerId: string
  db: Electric
}

export const upsertVectorLayerDisplaysForVectorLayer = async ({
  db,
  vectorLayerId,
}: Props) => {
  const vectorLayer: VectorLayer = await db.vector_layers.findUnique({
    where: { vector_layer_id: vectorLayerId },
  })
  if (!vectorLayer) {
    throw new Error(`vector_layer_id ${vectorLayerId} not found`)
  }
  if (!vectorLayer.type) {
    throw new Error(`vector_layer_id ${vectorLayerId} has no type`)
  }
  console.log('upsertVectorLayerDisplaysForVectorLayer', vectorLayer)
  // TODO: do this for wfs and upload
  if (vectorLayer.type !== 'own') {
    throw new Error(
      `creating vector_layer_displays for wfs and upload not implemented`,
    )
  }

  const table = vectorLayer.own_table
  const level = vectorLayer.own_table_level
  const displayByProperty = vectorLayer?.display_by_property
  const properties = vectorLayer?.properties

  const existingVectorLayerDisplays = await db.vector_layer_displays.findMany({
    where: { vector_layer_id: vectorLayerId },
  })

  if (!displayByProperty) {
    const firstExistingVectorLayerDisplay = existingVectorLayerDisplays?.[0]

    if (!firstExistingVectorLayerDisplay) {
      // create single display, then return
      const data = createVectorLayerDisplay({ vector_layer_id: vectorLayerId })
      return await db.vector_layer_displays.create({ data })
    }

    // remove all other displays, then return
    return await db.vector_layer_displays.deleteMany({
      where: {
        vector_layer_display_id: {
          not: firstExistingVectorLayerDisplay.vector_layer_display_id,
        },
      },
    })
  }

  if (
    !properties.includes(displayByProperty) &&
    existingVectorLayerDisplays.length
  ) {
    // remove all displays before creating new ones
    console.log('upsertVectorLayerDisplaysForVectorLayer removing all displays')
    await db.vector_layer_displays.deleteMany({
      where: { vector_layer_id: vectorLayerId },
    })
  }

  // TODO: do this for wfs and upload

  // get field of displayByPropertyField
  const field = await db.fields.findFirst({
    where: {
      name: displayByProperty,
      table_name: table,
      level,
      project_id: vectorLayer.project_id,
    },
  })

  console.log('upsertVectorLayerDisplaysForVectorLayer, field:', field)

  if (!field) {
    throw new Error(
      `field ${displayByProperty} not found in table ${table} level ${level}`,
    )
  }

  // if this field has a list_id, get the list
  if (field?.list_id) {
    console.log(
      'upsertVectorLayerDisplaysForVectorLayer, field has list_id: ',
      field.list_id,
    )
    const list = await db.lists.findUnique({
      where: { list_id: field.list_id },
    })
    if (!list) {
      throw new Error(`list_id ${field.list_id} not found`)
    }
    const listValues = await db.list_values.findMany({
      where: { list_id: field.list_id },
    })
    if (!listValues.length) {
      throw new Error(`list_id ${field.list_id} has no values`)
    }
    // remove all displays not in list
    await db.vector_layer_displays.deleteMany({
      where: {
        vector_layer_id: vectorLayerId,
        display_property_value: { notIn: listValues.map((v) => v.value) },
      },
    })
    // above does not remove null values...
    await db.vector_layer_displays.deleteMany({
      where: {
        vector_layer_id: vectorLayerId,
        display_property_value: null,
      },
    })
    // upsert displays in list
    const vLDDataArray = []
    for (const listValue of listValues) {
      const existingVectorLayerDisplay =
        await db.vector_layer_displays.findFirst({
          where: {
            vector_layer_id: vectorLayerId,
            display_property_value: listValue.value,
          },
        })
      // leave existing VLD unchanged
      if (existingVectorLayerDisplay) return

      const data = createVectorLayerDisplay({
        vector_layer_id: vectorLayerId,
        display_property_value: listValue.value,
      })
      vLDDataArray.push(data)
    }
    const chunked = chunkArrayWithMinSize(vLDDataArray, 500)
    for (const data of chunked) {
      await db.vector_layer_displays.createMany({ data })
    }
    return
  }

  // if this field has no list_id, get the unique values of this field in the table
  const where = { project_id: vectorLayer.project_id }
  if (table === 'places') {
    where.parent_id = level === 1 ? null : { not: null }
  }

  let tableRows
  try {
    tableRows = await db[table]?.findMany?.({
      where,
      select: [displayByProperty],
      distinct: [displayByProperty],
    })
  } catch (error) {
    console.error(
      'upsertVectorLayerDisplaysForVectorLayer, error fetching table rows',
      error,
    )
    throw new Error(
      `error fetching table rows for table ${table}, level ${level}`,
    )
  }
  const distinctValues = tableRows?.map((row) => row?.[displayByProperty])

  console.log('upsertVectorLayerDisplaysForVectorLayer', {
    tableRows,
    distinctValues,
  })

  const vLDDataArray = []
  for (const value of distinctValues) {
    const existingVectorLayerDisplay = await db.vector_layer_displays.findFirst(
      {
        where: {
          vector_layer_id: vectorLayerId,
          display_property_value: value,
        },
      },
    )
    // leave existing VLD unchanged
    if (existingVectorLayerDisplay) return

    const data = createVectorLayerDisplay({
      vector_layer_id: vectorLayerId,
      display_property_value: value,
    })
    vLDDataArray.push(data)
  }
  const chunked = chunkArrayWithMinSize(vLDDataArray, 500)
  for (const data of chunked) {
    await db.vector_layer_displays.createMany({ data })
  }
  return
}
