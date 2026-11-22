import { describe, expect, it, beforeAll, beforeEach, vi } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'

import { createTestDb } from './helpers/createTestDb.ts'

/**
 * createLayerPresentation is the map drawer's activation path: every layer
 * presentation is created client-side (the insert triggers are gone). The
 * transparent default must match the schema default (TRUE) — false makes
 * WMS tiles render as opaque white rectangles hiding the base map.
 */

vi.mock('../src/modules/getCapabilities.ts', () => ({
  getCapabilities: vi.fn(),
}))

import { createLayerPresentation } from '../src/modules/createRows.ts'
import { operationsQueueAtom, pgliteDbAtom, store } from '../src/store.ts'

let db: PGlite
let projectId: string
let wmsLayerId: string

beforeAll(async () => {
  const fixture = await createTestDb()
  db = fixture.db
  projectId = fixture.ids.project
  wmsLayerId = fixture.ids.wmsLayer
  store.set(pgliteDbAtom, db)
})

beforeEach(() => {
  store.set(operationsQueueAtom, [])
})

describe('createLayerPresentation', () => {
  it('creates presentations transparent by default, on the row and the queue', async () => {
    await createLayerPresentation({ wmsLayerId, active: true })

    const row = await db.query<{ transparent: boolean }>(
      `SELECT transparent FROM layer_presentations WHERE wms_layer_id = $1`,
      [wmsLayerId],
    )
    expect(row.rows[0]?.transparent).toBe(true)

    const ops = store
      .get(operationsQueueAtom)
      .filter((op) => op.table === 'layer_presentations')
    expect(ops).toHaveLength(1)
    expect(ops[0]!.draft).toMatchObject({
      wms_layer_id: wmsLayerId,
      project_id: projectId,
      transparent: true,
    })
  })
})
