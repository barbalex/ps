import { describe, expect, it, beforeAll, beforeEach, vi } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'

import { createTestDb } from './helpers/createTestDb.ts'

/**
 * setLayerPresentationActive is the map drawer's layer toggle: it flips the
 * layer_presentations.active design flag optimistically and queues the update
 * with the FULL previous row — partial UI rows as prev previously produced
 * broken reverts (null updated_at) and failed permission checks.
 */

vi.mock('../src/modules/getCapabilities.ts', () => ({
  getCapabilities: vi.fn(),
}))

import { setLayerPresentationActive } from '../src/modules/setLayerPresentationActive.ts'
import { operationsQueueAtom, pgliteDbAtom, store } from '../src/store.ts'

let db: PGlite
let projectId: string
let wmsLayerId: string

const PRESENTATION = '70000000-0000-7000-8000-0000000000aa'

beforeAll(async () => {
  const fixture = await createTestDb()
  db = fixture.db
  projectId = fixture.ids.project
  wmsLayerId = fixture.ids.wmsLayer

  await db.query(
    `INSERT INTO layer_presentations (layer_presentation_id, wms_layer_id, project_id, active)
     VALUES ($1, $2, $3, FALSE)`,
    [PRESENTATION, wmsLayerId, projectId],
  )
  store.set(pgliteDbAtom, db)
})

beforeEach(() => {
  store.set(operationsQueueAtom, [])
})

describe('setLayerPresentationActive', () => {
  it('activates the row and queues a full-row upsert', async () => {
    await setLayerPresentationActive(PRESENTATION, true)

    const row = await db.query<{ active: boolean }>(
      `SELECT active FROM layer_presentations WHERE layer_presentation_id = $1`,
      [PRESENTATION],
    )
    expect(row.rows[0]?.active).toBe(true)

    // an upsert (not an update): presentations the server never had —
    // created by the old insert triggers or with the queue skipped —
    // must be recreated, not discarded as no-row. Upserts bypass the
    // update aggregation, so they sit on the queue directly
    const ops = store
      .get(operationsQueueAtom)
      .filter((op) => op.table === 'layer_presentations')
    expect(ops).toHaveLength(1)
    expect(ops[0]!.operation).toBe('upsert')
    // the full row: a missing server row can be recreated from it
    expect(ops[0]!.draft).toMatchObject({
      layer_presentation_id: PRESENTATION,
      active: true,
      wms_layer_id: wmsLayerId,
    })
    expect(ops[0]!.draft?.updated_at).toBeDefined()
  })

  it('deactivates again', async () => {
    await setLayerPresentationActive(PRESENTATION, true)
    await setLayerPresentationActive(PRESENTATION, false)

    const row = await db.query<{ active: boolean }>(
      `SELECT active FROM layer_presentations WHERE layer_presentation_id = $1`,
      [PRESENTATION],
    )
    expect(row.rows[0]?.active).toBe(false)
  })
})
