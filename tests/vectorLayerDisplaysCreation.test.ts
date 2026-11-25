import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { v7 as uuidv7 } from 'uuid'

/**
 * A layer created on a client ends up with exactly one display without a
 * value — there and on the server (dev-doc section 9). The insert trigger
 * used to make one in the client's database too; without an operation it
 * never reached the server, where the same trigger made the real one for the
 * synced insert.
 *
 * Two in-memory Postgres stand in for the two sides: the client's database
 * (the app's schema and triggers, as PGlite runs them) and the server's (plus
 * the write-permission triggers and apply_operations, which applies the
 * client's queued operations the way PostgREST does).
 */

type Db = Awaited<
  ReturnType<typeof import('./helpers/createTestDb.ts').createTestDb>
>['db']
type StoreModule = typeof import('../src/store.ts')
type CreateRowsModule = typeof import('../src/modules/createRows.ts')
type DedupeModule = typeof import('../src/modules/dedupeVectorLayerDisplays.ts')
// what addOperationAtom is called with: the operation without id and time
type Operation = {
  table: string
  operation: string
  rowIdName?: string
  rowId?: string
  filter?: { function: string; column: string; value: unknown }
  draft?: Record<string, unknown>
}

const WRITER = '00000000-0000-7000-8000-000000000002' // write-all in the fixture
const claimsOfWriter = `SET request.jwt.claims = '{"role":"app_user","user_id":"${WRITER}"}';`

// a uuidv7 whose first 48 bits are the given unix milliseconds — the rest of
// a v7 is random, so this one sorts by that time
const uuidv7At = (ms: number) => {
  const time = ms.toString(16).padStart(12, '0')
  return `${time.slice(0, 8)}-${time.slice(8)}-7000-8000-000000000000`
}

let client: Db
let server: Db
let projectId: string
let store: StoreModule
let createRows: CreateRowsModule
let dedupe: DedupeModule
let setSpy: ReturnType<typeof vi.spyOn>

// the operations queued since the spy was (re)created, oldest first
const queued = (): Operation[] =>
  setSpy.mock.calls
    .filter(([atom]) => atom === store.addOperationAtom)
    .map(([, operation]) => operation as Operation)

const displayIdsOf = async (db: Db, vectorLayerId: string) =>
  (
    await db.query<{ vector_layer_display_id: string }>(
      `SELECT vector_layer_display_id FROM vector_layer_displays WHERE vector_layer_id = $1 ORDER BY vector_layer_display_id`,
      [vectorLayerId],
    )
  ).rows.map((row) => row.vector_layer_display_id)

const insertLayer = (db: Db, vectorLayerId: string) =>
  db.query(
    `INSERT INTO vector_layers (vector_layer_id, project_id, name, type) VALUES ($1, $2, $3, 'wfs')`,
    [vectorLayerId, projectId, vectorLayerId],
  )

const insertDisplay = (db: Db, vectorLayerId: string, displayId: string) =>
  db.query(
    `INSERT INTO vector_layer_displays (vector_layer_display_id, vector_layer_id) VALUES ($1, $2)`,
    [displayId, vectorLayerId],
  )

// the server applies what the client queued: "status: rows" per operation
const applyOnServer = async (operations: Operation[]) =>
  (
    await server.query<{ status: string; detail: string }>(
      `SELECT * FROM apply_operations($1::jsonb)`,
      [
        JSON.stringify(
          operations.map((operation) => ({
            ...operation,
            time: '2026-11-24T12:00:00Z',
          })),
        ),
      ],
    )
  ).rows.map((row) => `${row.status}: ${row.detail}`)

beforeAll(async () => {
  const { createTestDb } = await import('./helpers/createTestDb.ts')
  const [clientFixture, serverFixture] = await Promise.all([
    createTestDb(),
    createTestDb(['12_writePermissionTriggers.sql', '14_applyOperations.sql']),
  ])
  client = clientFixture.db
  server = serverFixture.db
  projectId = clientFixture.ids.project
  store = await import('../src/store.ts')
  createRows = await import('../src/modules/createRows.ts')
  dedupe = await import('../src/modules/dedupeVectorLayerDisplays.ts')
  // on the server every write is an app user's
  await server.exec(claimsOfWriter)
})

beforeEach(() => {
  store.store.set(store.pgliteDbAtom, client)
  setSpy = vi.spyOn(store.store, 'set')
})

afterEach(() => {
  setSpy.mockRestore()
})

afterAll(async () => {
  await client?.close()
  await server?.close()
})

describe('vector_layers_insert_trigger', () => {
  it('makes no display for a layer a client inserts itself', async () => {
    // not an app session: the display is made, as before
    const outside = '72000000-0000-7000-8000-000000000001'
    await insertLayer(client, outside)
    expect(await displayIdsOf(client, outside)).toHaveLength(1)

    // an app session: a direct insert is a client's queued write — the
    // client brings the display as a queued operation too
    await client.exec(claimsOfWriter)
    try {
      const byClient = '72000000-0000-7000-8000-000000000002'
      await insertLayer(client, byClient)
      expect(await displayIdsOf(client, byClient)).toHaveLength(0)

      // the own layers that a project's triggers create are no direct
      // inserts: they get their display
      const project = '73000000-0000-7000-8000-000000000001'
      await client.query(
        `INSERT INTO projects (project_id, name) VALUES ($1, 'Trigger Project')`,
        [project],
      )
      const ownLayers = await client.query(
        `SELECT vl.name, (SELECT count(*)::int FROM vector_layer_displays vld WHERE vld.vector_layer_id = vl.vector_layer_id) AS displays
         FROM vector_layers vl WHERE vl.project_id = $1 ORDER BY vl.name`,
        [project],
      )
      expect(ownLayers.rows).toEqual([
        { name: 'actions_1', displays: 1 },
        { name: 'checks_1', displays: 1 },
        { name: 'places_1', displays: 1 },
      ])
    } finally {
      await client.exec(`SET request.jwt.claims TO DEFAULT;`)
    }
  })
})

describe('createVectorLayer', () => {
  it('creates the layer with exactly one display, both as queued operations', async () => {
    const vectorLayerId = await createRows.createVectorLayer({
      projectId,
      type: 'wfs',
    })

    // one display, with the table's defaults: the look the insert trigger
    // gave new layers
    expect(
      (
        await client.query(
          `SELECT display_property_value, color, fill_opacity_percent FROM vector_layer_displays WHERE vector_layer_id = $1`,
          [vectorLayerId],
        )
      ).rows,
    ).toEqual([
      {
        display_property_value: null,
        color: '#3388ff',
        fill_opacity_percent: 100,
      },
    ])

    const operations = queued()
    expect(
      operations.map((operation) => [operation.table, operation.operation]),
    ).toEqual([
      ['vector_layers', 'insert'],
      ['vector_layer_displays', 'insert'],
    ])
    expect(
      operations.map((operation) => operation.draft?.vector_layer_id),
    ).toEqual([vectorLayerId, vectorLayerId])

    // what the server makes of it: its trigger leaves the direct insert to
    // the client, so the client's display is the only one
    expect(await applyOnServer(operations)).toEqual([
      'applied: 1 rows',
      'applied: 1 rows',
    ])
    expect(await displayIdsOf(server, vectorLayerId)).toHaveLength(1)
  })

  it('brings the same layer back without queueing anything again', async () => {
    const args = { projectId, type: 'wfs', name: 'the same layer' }
    const first = await createRows.createVectorLayer(args)
    expect(await createRows.createVectorLayer(args)).toBe(first)
    expect(queued().map((operation) => operation.table)).toEqual([
      'vector_layers',
      'vector_layer_displays',
    ])
    expect(await displayIdsOf(client, first)).toHaveLength(1)
  })
})

describe('dedupeVectorLayerDisplays', () => {
  // a layer as clients got them before: the display its insert trigger made
  // in its database, and the server's twin for the synced insert
  const layerWithDouble = async (makeTwinId: () => string) => {
    const vectorLayerId = uuidv7()
    await insertLayer(client, vectorLayerId)
    const localIds = await displayIdsOf(client, vectorLayerId)
    // uuidv7 has millisecond resolution: let time pass before the twin
    await new Promise((resolve) => setTimeout(resolve, 5))
    const twinId = makeTwinId()
    // the server has the layer (the synced insert) and the twin its trigger
    // made — which reached the client with the sync
    await insertLayer(server, vectorLayerId)
    await insertDisplay(server, vectorLayerId, twinId)
    await insertDisplay(client, vectorLayerId, twinId)
    return { vectorLayerId, localIds, twinId }
  }

  it('leaves the server’s twin — both sides have exactly that one', async () => {
    const { vectorLayerId, localIds, twinId } = await layerWithDouble(uuidv7)
    expect(localIds).toHaveLength(1)

    expect(await dedupe.dedupeVectorLayerDisplays()).toBe(1)
    expect(await displayIdsOf(client, vectorLayerId)).toEqual([twinId])

    const operations = queued()
    expect(
      operations.map((operation) => [
        operation.operation,
        operation.filter?.value ?? operation.rowId,
      ]),
    ).toEqual([
      ['delete', localIds],
      ['upsert', twinId],
    ])
    // the client's display never existed on the server: the delete matches
    // nothing. Its own is upserted onto itself
    expect(await applyOnServer(operations)).toEqual([
      'applied: 0 rows',
      'applied: 1 rows',
    ])
    expect(await displayIdsOf(server, vectorLayerId)).toEqual([twinId])
  })

  it('keeps the client’s twin when the clocks are off — and gives it to the server', async () => {
    // the server's display is the older one here
    const { vectorLayerId, localIds, twinId } = await layerWithDouble(() =>
      uuidv7At(Date.now() - 60_000),
    )
    expect(localIds[0] > twinId).toBe(true)

    expect(await dedupe.dedupeVectorLayerDisplays()).toBe(1)
    expect(await displayIdsOf(client, vectorLayerId)).toEqual(localIds)

    // the server's display is deleted, the kept one inserted: exactly one is
    // left
    expect(await applyOnServer(queued())).toEqual([
      'applied: 1 rows',
      'applied: 1 rows',
    ])
    expect(await displayIdsOf(server, vectorLayerId)).toEqual(localIds)
  })

  it('leaves layers with a single display without a value alone', async () => {
    const vectorLayerId = uuidv7()
    await insertLayer(client, vectorLayerId)
    // displayed by a field: one display per value, and one for no value
    for (const value of ['1', '2']) {
      await client.query(
        `INSERT INTO vector_layer_displays (vector_layer_id, display_property_value) VALUES ($1, $2)`,
        [vectorLayerId, value],
      )
    }
    setSpy.mockClear()

    expect(await dedupe.dedupeVectorLayerDisplays()).toBe(0)
    expect(queued()).toEqual([])
    expect(await displayIdsOf(client, vectorLayerId)).toHaveLength(3)
  })
})
