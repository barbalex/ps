import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'

import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'
import { deleteRowFromDb } from '../src/modules/deleteRow.ts'

let fixture: TestFixture

const checkId = '70000000-0000-7000-8000-0000000000e1'

beforeAll(async () => {
  fixture = await createTestDb()
  await fixture.db.exec(`
    INSERT INTO checks (check_id, place_id) VALUES
      ('${checkId}', '${fixture.ids.place}');
  `)
})

afterAll(async () => {
  await fixture.db.close()
})

describe('deleteRowFromDb', () => {
  it('deletes the row locally and queues a delete operation with prev', async () => {
    const addOperation =
      vi.fn<Parameters<typeof deleteRowFromDb>[1]>().mockResolvedValue(undefined)

    await deleteRowFromDb(fixture.db, addOperation, {
      table: 'checks',
      rowIdName: 'check_id',
      rowId: checkId,
    })

    const res = await fixture.db.query(`SELECT * FROM checks WHERE check_id = $1`, [
      checkId,
    ])
    expect(res.rows.length).toBe(0)

    expect(addOperation).toHaveBeenCalledTimes(1)
    const op = addOperation.mock.calls[0][0]
    expect(op.table).toBe('checks')
    expect(op.rowIdName).toBe('check_id')
    expect(op.rowId).toBe(checkId)
    expect(op.operation).toBe('delete')
    expect(op.prev.check_id).toBe(checkId)
  })

  it('does not throw when the row does not exist', async () => {
    const addOperation =
      vi.fn<Parameters<typeof deleteRowFromDb>[1]>().mockResolvedValue(undefined)

    await expect(
      deleteRowFromDb(fixture.db, addOperation, {
        table: 'checks',
        rowIdName: 'check_id',
        rowId: '70000000-0000-7000-8000-0000000000e2',
      }),
    ).resolves.toBeUndefined()
    expect(addOperation).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'delete', prev: {} }),
    )
  })
})
