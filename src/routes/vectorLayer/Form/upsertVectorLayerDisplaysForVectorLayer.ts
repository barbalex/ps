import { createVectorLayerDisplay } from '../../../modules/createRows.ts'
import { chunkArrayWithMinSize } from '../../../modules/chunkArrayWithMinSize.ts'

export const upsertVectorLayerDisplaysForVectorLayer = async ({
  db,
  vectorLayerId,
}) => {
  const vectorLayer = await db.vector_layers.findUnique({
    where: { vector_layer_id: vectorLayerId },
  })
  if (!vectorLayer) {
    throw new Error(`vector_layer_id ${vectorLayerId} not found`)
  }
  if (!vectorLayer.type) {
    throw new Error(`vector_layer_id ${vectorLayerId} has no type`)
  }
  // TODO: add this for wfs and upload
  if (vectorLayer.type !== 'own') {
    throw new Error(
      `creating vector_layer_displays for wfs and upload not implemented`,
    )
  }

  const projectId = vectorLayer.project_id
  const table = vectorLayer.own_table
  const level = vectorLayer.own_table_level
  const displayByProperty = vectorLayer.display_by_property
  const properties = vectorLayer.properties
  const fields = await db.fields.findMany({
    where: {
      table_name: table,
      level,
      project_id: projectId,
    },
    select: { name: true },
  })
  const fieldNames = fields.map((f) => f.name)
  const propertyIsInData = fieldNames.includes(displayByProperty)

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

  if (!field) {
    throw new Error(
      `field ${displayByProperty} not found in table ${table} level ${level}`,
    )
  }

  // if this field has a list_id, get the list
  // TODO: test this
  if (field?.list_id) {
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
  // tables with data property, sql to get by project_id:
  // TODO: test all
  const sqlByTable = {
    places: `SELECT DISTINCT ${
      propertyIsInData
        ? `json_extract(places.data, '$.${displayByProperty}') as ${displayByProperty}`
        : `${displayByProperty}`
    } FROM places
    inner join subprojects on subprojects.subproject_id = places.subproject_id 
    WHERE subprojects.project_id = '${projectId}' AND places.parent_id IS ${
      level === 1 ? 'NULL' : 'NOT NULL'
    }`,
    actions: `SELECT DISTINCT ${
      propertyIsInData
        ? `json_extract(actions.data, '$.${displayByProperty}') as ${displayByProperty}`
        : `${displayByProperty}`
    } FROM actions
    inner join places on places.place_id = actions.place_id 
    inner join subprojects on subprojects.subproject_id = places.subproject_id 
    WHERE subprojects.project_id = '${projectId}'`,
    checks: `SELECT DISTINCT ${
      propertyIsInData
        ? `json_extract(checks.data, '$.${displayByProperty}') as ${displayByProperty}`
        : `${displayByProperty}`
    } FROM checks 
    inner join places on places.place_id = checks.place_id 
    inner join subprojects on subprojects.subproject_id = places.subproject_id 
    WHERE subprojects.project_id = '${projectId}'`,
    occurrences_assigned: `SELECT DISTINCT ${
      propertyIsInData
        ? `json_extract(occurrences.data, '$.${displayByProperty}') as ${displayByProperty}`
        : `${displayByProperty}`
    } FROM occurrences 
    inner join places on places.place_id = occurrences.place_id 
    inner join subprojects on subprojects.subproject_id = places.subproject_id 
    WHERE subprojects.project_id = '${projectId}'`,
    occurrences_assigned_lines: `SELECT DISTINCT ${
      propertyIsInData
        ? `json_extract(occurrences.data, '$.${displayByProperty}') as ${displayByProperty}`
        : `${displayByProperty}`
    } FROM occurrences 
    inner join places on places.place_id = occurrences.place_id 
    inner join subprojects on subprojects.subproject_id = places.subproject_id 
    WHERE subprojects.project_id = '${projectId}'`,
    occurrences_to_assess: `SELECT DISTINCT ${
      propertyIsInData
        ? `json_extract(occurrences.data, '$.${displayByProperty}') as ${displayByProperty}`
        : `${displayByProperty}`
    } FROM occurrences 
    inner join occurrence_imports on occurrence_imports.occurrence_import_id = occurrences.occurrence_import_id 
    inner join subprojects on subprojects.subproject_id = occurrence_imports.subproject_id 
    WHERE subprojects.project_id = '${projectId}' and occurrences.not_to_assign = false and occurrences.place_id IS NULL`,
    occurrences_not_to_assign: `SELECT DISTINCT ${
      propertyIsInData
        ? `json_extract(occurrences.data, '$.${displayByProperty}') as ${displayByProperty}`
        : `${displayByProperty}`
    } FROM occurrences 
    inner join occurrence_imports on occurrence_imports.occurrence_import_id = occurrences.occurrence_import_id 
    inner join subprojects on subprojects.subproject_id = occurrence_imports.subproject_id 
    WHERE subprojects.project_id = '${projectId}' and occurrences.not_to_assign = true`,
  }

  // ISSUE 1: Most fields will be on the data property. Some not, i.e. 'name'
  // SOLUTION: Use the properties array to check if the field is in there? If not, query the table directly
  // ISSUE 2: How to query by properties in the data property? Depends on the db and library used.
  // SOLUTION: Either use raw sql
  let tableRows
  const sql = sqlByTable[table]
  try {
    tableRows = await db.rawQuery({ sql })
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

  const vLDDataArray = []
  for (const value of distinctValues) {
    const existingVectorLayerDisplay = await db.vector_layer_displays.findFirst(
      {
        where: {
          vector_layer_id: vectorLayerId,
          display_property_value: value ?? null,
        },
      },
    )
    // leave existing VLD unchanged
    if (existingVectorLayerDisplay) continue

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
