import { beforeAll, describe, expect, it } from 'vitest'

/**
 * Configurable per-property styling (dev-doc section 10): the own-table to
 * fields mapping and value normalization are pure; the display upsert runs
 * against a real in-memory Postgres loaded with the app's schema.
 *
 * store.ts is imported dynamically (same pattern as operationAggregation.test);
 * its window/document usage is guarded, so it loads fine in node.
 */

type StoreModule = typeof import('../src/store.ts')
type DbModule = typeof import('../src/modules/displayByProperty.ts')
type UpsertModule =
  typeof import('../src/formsAndLists/vectorLayer/Form/upsertVectorLayerDisplaysForVectorLayer.ts')
type TestFixture = Awaited<
  ReturnType<typeof import('./helpers/createTestDb.ts').createTestDb>
>

let store: StoreModule
let displayByProperty: DbModule
let upsert: UpsertModule['upsertVectorLayerDisplaysForVectorLayer']
let db: TestFixture['db']
let ids: TestFixture['ids']

beforeAll(async () => {
  store = await import('../src/store.ts')
  displayByProperty = await import('../src/modules/displayByProperty.ts')
  upsert = (
    await import('../src/formsAndLists/vectorLayer/Form/upsertVectorLayerDisplaysForVectorLayer.ts')
  ).upsertVectorLayerDisplaysForVectorLayer
  const { createTestDb } = await import('./helpers/createTestDb.ts')
  const fixture = await createTestDb()
  db = fixture.db
  ids = fixture.ids
  store.store.set(store.pgliteDbAtom, db)
})

const getLayerRow = async (vectorLayerId: string) => {
  const res = await db.query(
    `SELECT * FROM vector_layers WHERE vector_layer_id = $1`,
    [vectorLayerId],
  )
  return res.rows[0]
}

const getDisplayValues = async (vectorLayerId: string) => {
  const res = await db.query(
    `SELECT display_property_value FROM vector_layer_displays WHERE vector_layer_id = $1 ORDER BY display_property_value`,
    [vectorLayerId],
  )
  return (res.rows as { display_property_value: string | null }[]).map(
    (r) => r.display_property_value,
  )
}

const insertLayer = async (args: {
  vectorLayerId: string
  ownTable: string
  displayByProperty: string | null
  properties?: string[]
}) => {
  await db.query(
    `INSERT INTO vector_layers (vector_layer_id, project_id, name, type, own_table, display_by_property, properties)
     VALUES ($1, $2, $3, 'own', $4, $5, $6)`,
    [
      args.vectorLayerId,
      ids.project,
      `${args.ownTable}-${args.vectorLayerId.slice(-4)}`,
      args.ownTable,
      args.displayByProperty,
      JSON.stringify(args.properties ?? []),
    ],
  )
}

describe('ownTableToFieldsTable', () => {
  it('maps own_table views to the real table their fields are stored under', () => {
    expect(
      displayByProperty.ownTableToFieldsTable('observations_to_assess', null),
    ).toEqual({ tableName: 'observations', level: null })
    expect(
      displayByProperty.ownTableToFieldsTable(
        'observations_not_to_assign',
        null,
      ),
    ).toEqual({ tableName: 'observations', level: null })
    expect(
      displayByProperty.ownTableToFieldsTable('observations_assigned', 2),
    ).toEqual({ tableName: 'observations', level: 2 })
    expect(displayByProperty.ownTableToFieldsTable('places', 1)).toEqual({
      tableName: 'places',
      level: 1,
    })
    // lines layers have fixed properties and no fields
    expect(
      displayByProperty.ownTableToFieldsTable('observations_assigned_lines', 1),
    ).toEqual({ tableName: null, level: null })
  })
})

describe('propertyValueToText', () => {
  it('normalizes raw jsonb values to the text display_property_value stores', () => {
    // jsonb booleans never matched the text column before
    expect(displayByProperty.propertyValueToText(true)).toBe('true')
    expect(displayByProperty.propertyValueToText(false)).toBe('false')
    expect(displayByProperty.propertyValueToText(5)).toBe('5')
    expect(displayByProperty.propertyValueToText('active')).toBe('active')
    expect(displayByProperty.propertyValueToText(null)).toBe(null)
    expect(displayByProperty.propertyValueToText(undefined)).toBe(null)
  })
})

describe('upsertVectorLayerDisplaysForVectorLayer', () => {
  it('creates one display per list value for a list field (and is idempotent)', async () => {
    const listId = '40000000-0000-7000-8000-000000000001'
    const fieldId = '41000000-0000-7000-8000-000000000001'
    const vectorLayerId = '42000000-0000-7000-8000-000000000001'
    await db.query(
      `INSERT INTO lists (list_id, project_id, name, value_type) VALUES ($1, $2, 'Status', 'text')`,
      [listId, ids.project],
    )
    await db.query(
      `INSERT INTO list_values (list_value_id, list_id, value_text) VALUES
        ('43000000-0000-7000-8000-000000000001', $1, 'aktuell'),
        ('43000000-0000-7000-8000-000000000002', $1, 'erloschen')`,
      [listId],
    )
    await db.query(
      `INSERT INTO fields (field_id, project_id, table_name, level, name, field_label, list_id)
       VALUES ($1, $2, 'observations', 1, 'status', 'Status', $3)`,
      [fieldId, ids.project, listId],
    )
    await insertLayer({
      vectorLayerId,
      ownTable: 'observations_to_assess',
      displayByProperty: 'status',
      properties: ['status'],
    })

    await upsert({ vectorLayer: await getLayerRow(vectorLayerId) })
    expect(await getDisplayValues(vectorLayerId)).toEqual([
      'aktuell',
      'erloschen',
    ])

    // re-running must not duplicate displays (the loop used to return early)
    await upsert({ vectorLayer: await getLayerRow(vectorLayerId) })
    expect(await getDisplayValues(vectorLayerId)).toEqual([
      'aktuell',
      'erloschen',
    ])

    // removing a list value removes its display
    await db.query(
      `DELETE FROM list_values WHERE list_value_id = '43000000-0000-7000-8000-000000000002'`,
    )
    await upsert({ vectorLayer: await getLayerRow(vectorLayerId) })
    expect(await getDisplayValues(vectorLayerId)).toEqual(['aktuell'])
  })

  it('creates displays per distinct data-field value for a places layer', async () => {
    // the field key must be quoted in the distinct query: `data ->> 'status'`
    const fieldId = '41000000-0000-7000-8000-000000000002'
    const vectorLayerId = '42000000-0000-7000-8000-000000000005'
    await db.query(
      `INSERT INTO fields (field_id, project_id, table_name, level, name, field_label)
       VALUES ($1, $2, 'places', 1, 'status', 'Status')`,
      [fieldId, ids.project],
    )
    await db.query(
      `INSERT INTO places (place_id, subproject_id, level, parent_id, data) VALUES
        ('30000000-0000-7000-8000-000000000011', $1, 1, NULL, '{"status":"aktuell"}'),
        ('30000000-0000-7000-8000-000000000012', $1, 1, NULL, '{"status":"erloschen"}'),
        ('30000000-0000-7000-8000-000000000013', $1, 1, NULL, '{"other":"x"}')`,
      [ids.subproject],
    )
    await insertLayer({
      vectorLayerId,
      ownTable: 'places',
      displayByProperty: 'status',
      properties: ['status'],
    })

    await upsert({ vectorLayer: await getLayerRow(vectorLayerId) })
    // places without the field (the fixture place and the "other" one) share
    // the null display
    expect(await getDisplayValues(vectorLayerId)).toEqual([
      'aktuell',
      'erloschen',
      null,
    ])

    // idempotent: the null display is found via IS NULL, not duplicated
    await upsert({ vectorLayer: await getLayerRow(vectorLayerId) })
    expect(
      (await getDisplayValues(vectorLayerId)).filter((v) => v === null),
    ).toHaveLength(1)
  })

  it('creates displays per distinct value for the built-in absence column', async () => {
    const vectorLayerId = '42000000-0000-7000-8000-000000000002'
    const observationImportId = '44000000-0000-7000-8000-000000000001'
    await db.query(
      `INSERT INTO observation_imports (observation_import_id, subproject_id)
       VALUES ($1, $2)`,
      [observationImportId, ids.subproject],
    )
    await db.query(
      `INSERT INTO observations (observation_id, observation_import_id, not_to_assign, absence)
       VALUES
        ('45000000-0000-7000-8000-000000000001', $1, false, true),
        ('45000000-0000-7000-8000-000000000002', $1, false, false)`,
      [observationImportId],
    )
    await insertLayer({
      vectorLayerId,
      ownTable: 'observations_to_assess',
      displayByProperty: 'absence',
    })

    await upsert({ vectorLayer: await getLayerRow(vectorLayerId) })
    // booleans are stored as text like displayFromFeature compares them
    expect(await getDisplayValues(vectorLayerId)).toEqual(['false', 'true'])
  })

  it('unsetting display_by_property keeps one display of this layer only', async () => {
    const vectorLayerId = '42000000-0000-7000-8000-000000000003'
    const otherLayerId = '42000000-0000-7000-8000-000000000004'
    await insertLayer({
      vectorLayerId,
      ownTable: 'observations_to_assess',
      displayByProperty: null,
      properties: [],
    })
    await insertLayer({
      vectorLayerId: otherLayerId,
      ownTable: 'observations_to_assess',
      displayByProperty: 'absence',
      properties: [],
    })
    // the insert trigger gives each layer a default (null) display;
    // manual values on top: three displays per layer
    await db.query(
      `INSERT INTO vector_layer_displays (vector_layer_display_id, vector_layer_id, display_property_value) VALUES
        ('46000000-0000-7000-8000-000000000031', $1, 'true'),
        ('46000000-0000-7000-8000-000000000032', $1, 'false')`,
      [vectorLayerId],
    )
    await db.query(
      `INSERT INTO vector_layer_displays (vector_layer_display_id, vector_layer_id, display_property_value) VALUES
        ('46000000-0000-7000-8000-000000000041', $1, 'true'),
        ('46000000-0000-7000-8000-000000000042', $1, 'false')`,
      [otherLayerId],
    )
    const otherValuesBefore = await getDisplayValues(otherLayerId)

    await upsert({ vectorLayer: await getLayerRow(vectorLayerId) })

    // this layer is reduced to a single display...
    expect((await getDisplayValues(vectorLayerId)).length).toBe(1)
    // ...while the other layer's displays are untouched (the delete used to
    // lack the vector_layer_id filter and wiped every other layer)
    expect(await getDisplayValues(otherLayerId)).toEqual(otherValuesBefore)
  })
})
