import { createVectorLayerDisplay } from '../../../modules/createRows.ts'

export const upsertVectorLayerDisplaysForVectorLayer = async ({
  db,
  vectorLayerId,
}) => {
  const resVL = await db.query(
    `SELECT * FROM vector_layers WHERE vector_layer_id = $1`,
    [vectorLayerId],
  )
  const vectorLayer = resVL.rows[0]
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

  const resFields = await db.query(
    `SELECT name FROM fields WHERE table_name = $1 AND level = $2 AND project_id = $3`,
    [table, level, projectId],
  )
  const fields = resFields.rows
  const fieldNames = fields.map((f) => f.name)
  const propertyIsInData = fieldNames.includes(displayByProperty)

  const existingVLDRes = await db.query(
    `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
    [vectorLayerId],
  )
  const existingVectorLayerDisplays = existingVLDRes.rows

  if (!displayByProperty) {
    const firstExistingVectorLayerDisplay = existingVectorLayerDisplays?.[0]

    if (!firstExistingVectorLayerDisplay) {
      // create single display, then return
      return await createVectorLayerDisplay({ vector_layer_id: vectorLayerId })
    }

    // remove all other displays, then return
    return await db.query(
      `DELETE FROM vector_layer_displays WHERE vector_layer_display_id != $1`,
      [firstExistingVectorLayerDisplay.vector_layer_display_id],
    )
  }

  if (
    !properties.includes(displayByProperty) &&
    existingVectorLayerDisplays.length
  ) {
    // remove all displays before creating new ones
    await db.query(
      `DELETE FROM vector_layer_displays WHERE vector_layer_id = $1`,
      [vectorLayerId],
    )
  }

  // TODO: do this for wfs and upload

  // get field of displayByPropertyField
  const fieldRes = await db.query(
    `SELECT * FROM fields WHERE name = $1 AND table_name = $2 AND level = $3 AND project_id = $4`,
    [displayByProperty, table, level, projectId],
  )
  const field = fieldRes.rows[0]

  if (!field) {
    throw new Error(
      `field ${displayByProperty} not found in table ${table} level ${level}`,
    )
  }

  // if this field has a list_id, get the list
  // TODO: test this
  if (field?.list_id) {
    const listRes = await db.query(`SELECT * FROM lists WHERE list_id = $1`, [
      field.list_id,
    ])
    const list = listRes.rows?.[0]
    if (!list) {
      throw new Error(`list_id ${field.list_id} not found`)
    }
    const lVRes = await db.query(
      `SELECT * FROM list_values WHERE list_id = $1`,
      [field.list_id],
    )
    const listValues = lVRes.rows
    if (!listValues.length) {
      throw new Error(`list_id ${field.list_id} has no values`)
    }
    // remove all displays not in list
    await db.query(
      `DELETE FROM vector_layer_displays WHERE vector_layer_id = $1 AND display_property_value NOT IN (${listValues
        .map((v) => v.value)
        .map((v, i) => `$${i + 2}`)
        .join(', ')})`,
      [vectorLayerId, ...listValues.map((v) => v.value)],
    )
    // above does not remove null values...
    await db.query(
      `DELETE FROM vector_layer_displays WHERE vector_layer_id = $1 AND display_property_value IS NULL`,
      [vectorLayerId],
    )
    // upsert displays in list
    for (const listValue of listValues) {
      const res = await db.query(
        `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1 AND display_property_value = $2`,
        [vectorLayerId, listValue.value],
      )
      const existingVectorLayerDisplay = res.rows[0]
      // leave existing VLD unchanged
      if (existingVectorLayerDisplay) return

      await createVectorLayerDisplay({
        vector_layer_id: vectorLayerId,
        display_property_value: listValue.value,
      })
    }
    return
  }

  // if this field has no list_id, get the unique values of this field in the table
  // tables with data property, sql to get by project_id:
  // TODO: test all
  const sqlByTable = {
    places: `SELECT DISTINCT ${
      propertyIsInData
        ? `places.data ->> ${displayByProperty} as ${displayByProperty}`
        : `places.${displayByProperty}`
    } FROM places
    inner join subprojects on subprojects.subproject_id = places.subproject_id 
    WHERE subprojects.project_id = '${projectId}' AND places.parent_id IS ${
      level === 1 ? 'NULL' : 'NOT NULL'
    }`,
    actions: `SELECT DISTINCT ${
      propertyIsInData
        ? `actions.data ->> ${displayByProperty} as ${displayByProperty}`
        : `actions.${displayByProperty}`
    } FROM actions
    inner join places on places.place_id = actions.place_id 
    inner join subprojects on subprojects.subproject_id = places.subproject_id 
    WHERE subprojects.project_id = '${projectId}'`,
    checks: `SELECT DISTINCT ${
      propertyIsInData
        ? `checks.data ->> ${displayByProperty} as ${displayByProperty}`
        : `checks.${displayByProperty}`
    } FROM checks 
    inner join places on places.place_id = checks.place_id 
    inner join subprojects on subprojects.subproject_id = places.subproject_id 
    WHERE subprojects.project_id = '${projectId}'`,
    occurrences_assigned: `SELECT DISTINCT ${
      propertyIsInData
        ? `occurrences.data ->> ${displayByProperty} as ${displayByProperty}`
        : `occurrences.${displayByProperty}`
    } FROM occurrences 
    inner join places on places.place_id = occurrences.place_id 
    inner join subprojects on subprojects.subproject_id = places.subproject_id 
    WHERE subprojects.project_id = '${projectId}'`,
    occurrences_assigned_lines: `SELECT DISTINCT ${
      propertyIsInData
        ? `occurrences.data ->> ${displayByProperty} as ${displayByProperty}`
        : `occurrences.${displayByProperty}`
    } FROM occurrences 
    inner join places on places.place_id = occurrences.place_id 
    inner join subprojects on subprojects.subproject_id = places.subproject_id 
    WHERE subprojects.project_id = '${projectId}'`,
    occurrences_to_assess: `SELECT DISTINCT ${
      propertyIsInData
        ? `occurrences.data ->> ${displayByProperty} as ${displayByProperty}`
        : `occurrences.${displayByProperty}`
    } FROM occurrences 
    inner join occurrence_imports on occurrence_imports.occurrence_import_id = occurrences.occurrence_import_id 
    inner join subprojects on subprojects.subproject_id = occurrence_imports.subproject_id 
    WHERE subprojects.project_id = '${projectId}' and occurrences.not_to_assign = false and occurrences.place_id IS NULL`,
    occurrences_not_to_assign: `SELECT DISTINCT ${
      propertyIsInData
        ? `occurrences.data ->> ${displayByProperty} as ${displayByProperty}`
        : `occurrences.${displayByProperty}`
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
    const res = await db.query(sql)
    tableRows = res.rows
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

  for (const value of distinctValues) {
    const res = await db.query(
      `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1 AND display_property_value = $2`,
      [vectorLayerId, value ?? null],
    )
    const existingVectorLayerDisplay = res.rows?.[0]
    // leave existing VLD unchanged
    if (existingVectorLayerDisplay) continue

    await createVectorLayerDisplay({
      vector_layer_id: vectorLayerId,
      display_property_value: value,
    })
  }
  return
}
