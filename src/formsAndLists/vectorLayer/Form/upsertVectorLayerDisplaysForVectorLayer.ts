import { createVectorLayerDisplay } from '../../../modules/createRows.ts'
import {
  builtInDisplayByProperties,
  ownTableToFieldsTable,
} from '../../../modules/displayByProperty.ts'
import { addOperationAtom, store, pgliteDbAtom } from '../../../store.ts'

import type { PGlite } from '@electric-sql/pglite'
import type VectorLayers from '../../../models/public/VectorLayers.ts'
import type VectorLayerDisplays from '../../../models/public/VectorLayerDisplays.ts'
import type Fields from '../../../models/public/Fields.ts'

// display_property_value = NULL never matches via `= $2`; null values need
// IS NULL (else every run creates a duplicate display for them)
const findExistingDisplay = async (
  db: PGlite,
  vectorLayerId: string,
  value: string | null,
) => {
  const res = await db.query(
    value == null ?
      `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1 AND display_property_value IS NULL`
    : `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1 AND display_property_value = $2`,
    value == null ? [vectorLayerId] : [vectorLayerId, value],
  )
  return res?.rows?.[0] as VectorLayerDisplays | undefined
}

export const upsertVectorLayerDisplaysForVectorLayer = async ({
  vectorLayer,
}: {
  vectorLayer: VectorLayers
}) => {
  const db = store.get(pgliteDbAtom)!
  if (!vectorLayer) {
    throw new Error(
      `vector_layer_id ${(vectorLayer as VectorLayers).vector_layer_id} not found`,
    )
  }
  if (!vectorLayer.type) {
    throw new Error(
      `vector_layer_id ${vectorLayer.vector_layer_id} has no type`,
    )
  }
  // TODO: add this for wfs and upload
  if (vectorLayer.type !== 'own') {
    throw new Error(
      `creating vector_layer_displays for wfs and upload not implemented`,
    )
  }

  const projectId = vectorLayer.project_id
  const table = vectorLayer.own_table
  // fields are stored per real table, not per own_table view
  // (observation layers style the observations table)
  const { tableName, level: fieldsLevel } = ownTableToFieldsTable(
    table,
    vectorLayer.own_table_level,
  )
  const hasFieldsLevel = fieldsLevel != null
  const displayByProperty = vectorLayer.display_by_property
  const properties = vectorLayer.properties

  let fieldNames: string[] = []
  if (tableName) {
    const resFields = await db.query(
      `SELECT name FROM fields WHERE table_name = $1 AND project_id = $2${
        hasFieldsLevel ? ' AND level = $3' : ''
      }`,
      hasFieldsLevel ? [tableName, projectId, fieldsLevel] : [tableName, projectId],
    )
    fieldNames = (resFields.rows as { name: string }[]).map((f) => f.name)
  }
  const propertyIsInData = fieldNames.includes(displayByProperty!)

  const existingVLDRes = await db.query(
    `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
    [vectorLayer.vector_layer_id],
  )
  const existingVectorLayerDisplays = (existingVLDRes?.rows ??
    []) as VectorLayerDisplays[]

  if (!displayByProperty) {
    const firstExistingVectorLayerDisplay = existingVectorLayerDisplays?.[0]

    if (!firstExistingVectorLayerDisplay) {
      // create single display, then return
      return await createVectorLayerDisplay({
        vectorLayerId: vectorLayer.vector_layer_id,
      })
    }

    // remove all other displays of this layer, then return
    const toDeleteRes = await db.query(
      `SELECT vector_layer_display_id FROM vector_layer_displays WHERE vector_layer_id = $1 AND vector_layer_display_id != $2`,
      [
        vectorLayer.vector_layer_id,
        firstExistingVectorLayerDisplay.vector_layer_display_id,
      ],
    )
    const toDeleteVectorLayerDisplayIds = (toDeleteRes?.rows ?? []) as {
      vector_layer_display_id: string
    }[]
    await db.query(
      `DELETE FROM vector_layer_displays WHERE vector_layer_id = $1 AND vector_layer_display_id != $2`,
      [
        vectorLayer.vector_layer_id,
        firstExistingVectorLayerDisplay.vector_layer_display_id,
      ],
    )
    if (toDeleteVectorLayerDisplayIds.length) {
      store.set(addOperationAtom, {
        table: 'vector_layer_displays',
        operation: 'delete',
        filter: {
          function: 'in',
          column: 'vector_layer_display_id',
          value: toDeleteVectorLayerDisplayIds.map(
            (v) => v.vector_layer_display_id,
          ),
        },
      })
    }
    return
  }

  if (
    !((properties ?? []) as string[]).includes(displayByProperty) &&
    existingVectorLayerDisplays.length
  ) {
    // remove all displays before creating new ones
    await db.query(
      `DELETE FROM vector_layer_displays WHERE vector_layer_id = $1`,
      [vectorLayer.vector_layer_id],
    )
    store.set(addOperationAtom, {
      table: 'vector_layer_displays',
      operation: 'delete',
      filter: {
        function: 'eq',
        column: 'vector_layer_id',
        value: vectorLayer.vector_layer_id,
      },
    })
  }

  // TODO: do this for wfs and upload

  // get field of displayByPropertyField
  const fieldRes = await db.query(
    `SELECT * FROM fields WHERE name = $1 AND table_name = $2 AND project_id = $3${
      hasFieldsLevel ? ' AND level = $4' : ''
    }`,
    hasFieldsLevel
      ? [displayByProperty, tableName, projectId, fieldsLevel]
      : [displayByProperty, tableName, projectId],
  )
  const field = fieldRes?.rows?.[0] as Fields | undefined

  // real table columns (not fields) can be styled by, e.g. observations.absence
  const isBuiltInDisplayByProperty =
    (builtInDisplayByProperties[table ?? ''] ?? []).includes(
      displayByProperty!,
    )

  if (!field && !isBuiltInDisplayByProperty) {
    throw new Error(
      `field ${displayByProperty} not found in table ${tableName} level ${fieldsLevel}`,
    )
  }

  // if this field has a list_id, get the list
  if (field?.list_id) {
    const listRes = await db.query(`SELECT * FROM lists WHERE list_id = $1`, [
      field.list_id,
    ])
    const list = listRes?.rows?.[0]
    if (!list) {
      throw new Error(`list_id ${field.list_id} not found`)
    }
    // the widgets write the typed value column into data; the display value
    // is its text representation
    const lVRes = await db.query(
      `SELECT lv.list_value_id,
        CASE l.value_type
          WHEN 'integer' THEN lv.value_integer::text
          WHEN 'numeric' THEN lv.value_numeric::text
          WHEN 'text' THEN nullif(lv.value_text, '')
          WHEN 'date' THEN lv.value_date::text
          WHEN 'datetime' THEN lv.value_datetime::text
        END AS value
      FROM list_values lv
      INNER JOIN lists l ON l.list_id = lv.list_id
      WHERE lv.list_id = $1`,
      [field.list_id],
    )
    const listValues = (lVRes?.rows ?? []) as {
      list_value_id: string
      value: string | null
    }[]
    if (!listValues.length) {
      throw new Error(`list_id ${field.list_id} has no values`)
    }
    // remove all displays whose value is null or no longer in the list
    const valuesInList = listValues
      .map((v) => v.value)
      .filter((v): v is string => v != null)
    const toDeleteRes = valuesInList.length ?
      await db.query(
        `SELECT vector_layer_display_id FROM vector_layer_displays WHERE vector_layer_id = $1 AND (display_property_value IS NULL OR display_property_value NOT IN (${valuesInList
          .map((_v, i) => `$${i + 2}`)
          .join(', ')}))`,
        [vectorLayer.vector_layer_id, ...valuesInList],
      )
    : await db.query(
        `SELECT vector_layer_display_id FROM vector_layer_displays WHERE vector_layer_id = $1`,
        [vectorLayer.vector_layer_id],
      )
    const toDeleteVectorLayerDisplayIds = (toDeleteRes?.rows ?? []) as {
      vector_layer_display_id: string
    }[]
    if (toDeleteVectorLayerDisplayIds.length) {
      const idsToDelete = toDeleteVectorLayerDisplayIds.map(
        (v) => v.vector_layer_display_id,
      )
      await db.query(
        `DELETE FROM vector_layer_displays WHERE vector_layer_display_id = ANY($1)`,
        [idsToDelete],
      )
      store.set(addOperationAtom, {
        table: 'vector_layer_displays',
        operation: 'delete',
        filter: {
          function: 'in',
          column: 'vector_layer_display_id',
          value: idsToDelete,
        },
      })
    }
    // upsert displays in list
    for (const listValue of listValues) {
      const existingVectorLayerDisplay = await findExistingDisplay(
        db,
        vectorLayer.vector_layer_id,
        listValue.value,
      )
      // leave existing VLD unchanged
      if (existingVectorLayerDisplay) continue

      await createVectorLayerDisplay({
        vectorLayerId: vectorLayer.vector_layer_id,
        displayPropertyValue: listValue.value,
      })
    }
    return
  }

  // if this field has no list_id, get the unique values of this field in the table
  // tables with data property, sql to get by project_id:
  // the field name must be a quoted key literal (`data ->> 'field'`) and a
  // quoted alias (else the column folds to lowercase and row[displayByProperty] misses)
  const dataKey = displayByProperty!.replace(/'/g, "''")
  const dataAccess = (tableName: string) =>
    propertyIsInData
      ? `${tableName}.data ->> '${dataKey}' as "${displayByProperty}"`
      : `${tableName}.${displayByProperty}`
  const sqlByTable = {
    places: `SELECT DISTINCT ${dataAccess('places')} FROM places
    inner join subprojects on subprojects.subproject_id = places.subproject_id
    WHERE subprojects.project_id = '${projectId}' AND places.parent_id IS ${
      vectorLayer.own_table_level === 1 ? 'NULL' : 'NOT NULL'
    }`,
    actions: `SELECT DISTINCT ${dataAccess('actions')} FROM actions
    inner join places on places.place_id = actions.place_id
    inner join subprojects on subprojects.subproject_id = places.subproject_id
    WHERE subprojects.project_id = '${projectId}'`,
    checks: `SELECT DISTINCT ${dataAccess('checks')} FROM checks
    inner join places on places.place_id = checks.place_id
    inner join subprojects on subprojects.subproject_id = places.subproject_id
    WHERE subprojects.project_id = '${projectId}'`,
    observations_assigned: `SELECT DISTINCT ${dataAccess('observations')} FROM observations
    inner join places on places.place_id = observations.place_id
    inner join subprojects on subprojects.subproject_id = places.subproject_id
    WHERE subprojects.project_id = '${projectId}'`,
    observations_assigned_lines: `SELECT DISTINCT ${dataAccess('observations')} FROM observations
    inner join places on places.place_id = observations.place_id
    inner join subprojects on subprojects.subproject_id = places.subproject_id
    WHERE subprojects.project_id = '${projectId}'`,
    observations_to_assess: `SELECT DISTINCT ${dataAccess('observations')} FROM observations
    inner join observation_imports on observation_imports.observation_import_id = observations.observation_import_id
    inner join subprojects on subprojects.subproject_id = observation_imports.subproject_id
    WHERE subprojects.project_id = '${projectId}' and observations.not_to_assign = false and observations.place_id IS NULL`,
    observations_not_to_assign: `SELECT DISTINCT ${dataAccess('observations')} FROM observations
    inner join observation_imports on observation_imports.observation_import_id = observations.observation_import_id
    inner join subprojects on subprojects.subproject_id = observation_imports.subproject_id
    WHERE subprojects.project_id = '${projectId}' and observations.not_to_assign = true`,
  }

  // ISSUE 1: Most fields will be on the data property. Some not, i.e. 'name'
  // SOLUTION: Use the properties array to check if the field is in there? If not, query the table directly
  // ISSUE 2: How to query by properties in the data property? Depends on the db and library used.
  // SOLUTION: Either use raw sql
  let tableRows: Record<string, unknown>[] | undefined
  const sql = sqlByTable[table!]
  try {
    const res = await db.query(sql)
    tableRows = res?.rows as Record<string, unknown>[]
  } catch (error) {
    console.error(
      'upsertVectorLayerDisplaysForVectorLayer, error fetching table rows',
      error,
    )
    throw new Error(
      `error fetching table rows for table ${table}, level ${vectorLayer.own_table_level}`,
      { cause: error },
    )
  }
  const distinctValues = tableRows?.map((row) => row?.[displayByProperty])

  for (const value of distinctValues ?? []) {
    // booleans/numbers become text like displayFromFeature compares them
    const valueText = value == null ? null : String(value)
    const existingVectorLayerDisplay = await findExistingDisplay(
      db,
      vectorLayer.vector_layer_id,
      valueText,
    )
    // leave existing VLD unchanged
    if (existingVectorLayerDisplay) continue

    await createVectorLayerDisplay({
      vectorLayerId: vectorLayer.vector_layer_id,
      displayPropertyValue: valueText,
    })
  }

  return
}
