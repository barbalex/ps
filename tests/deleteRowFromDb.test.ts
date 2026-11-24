import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'

import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'
import { deleteRowFromDb } from '../src/modules/deleteRow.ts'
import { columnsForRestore, undoDeleteRow } from '../src/modules/undoDelete.ts'
import { captureCascadeClosure } from '../src/modules/cascadeDelete.ts'
import { operationsQueueAtom, pgliteDbAtom, store } from '../src/store.ts'

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

    // with a mocked addOperation the queued-op lookup finds nothing, so the
    // flow reports failure instead of publishing an undo — key point: no throw
    await expect(
      deleteRowFromDb(fixture.db, addOperation, {
        table: 'checks',
        rowIdName: 'check_id',
        rowId: '70000000-0000-7000-8000-0000000000e2',
      }),
    ).resolves.toBe('failed')
    expect(addOperation).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'delete', prev: {} }),
    )
  })
})

describe('columnsForRestore', () => {
  it('keeps only the sync shape columns that exist in prev', () => {
    // label is GENERATED (never restorable by insert), sys_period is
    // managed by the history trigger, unknown_col is not part of the shape
    const prev = {
      place_check_report_id: 'x',
      place_id: 'p',
      year: 2021,
      data: null,
      label: '2021',
      sys_period: '[,)',
      created_at: 't',
      updated_at: 't',
      updated_by: 'me',
      unknown_col: 1,
    }
    expect(columnsForRestore('check_reports', prev)).toEqual([
      'place_check_report_id',
      'place_id',
      'year',
      'data',
      'created_at',
      'updated_at',
      'updated_by',
    ])
  })

  it('returns empty for tables without a sync shape', () => {
    expect(columnsForRestore('no_such_table', { a: 1 })).toEqual([])
  })
})

describe('cascade capture + undo restore', () => {
  const placeId = '30000000-0000-7000-8000-0000000000e5'
  const checkId = '70000000-0000-7000-8000-0000000000e6'
  const quantityId = '70000000-0000-7000-8000-0000000000e7'

  beforeAll(async () => {
    await fixture.db.exec(`
      INSERT INTO places (place_id, subproject_id, level, name) VALUES
        ('${placeId}', '${fixture.ids.subproject}', 1, 'cascade roundtrip place');
      INSERT INTO checks (check_id, place_id) VALUES
        ('${checkId}', '${placeId}');
      INSERT INTO check_quantities (check_quantity_id, check_id, quantity_integer) VALUES
        ('${quantityId}', '${checkId}', 42);
    `)
    // undoDeleteRow reads the db from the store
    store.set(pgliteDbAtom, fixture.db)
  })

  const countWhere = async (table: string, col: string, id: string) => {
    const res = await fixture.db.query(
      `SELECT count(*)::int AS c FROM ${table} WHERE ${col} = $1`,
      [id],
    )
    return res.rows[0].c as number
  }

  it('captures the cascade breadth-first, roles tables first', async () => {
    const closure = await captureCascadeClosure(fixture.db, {
      table: 'places',
      rowIdName: 'place_id',
      rowId: placeId,
    })
    const tables = closure.map((l) => l.table)
    expect(tables[0]).toBe('places')
    expect(tables).toContain('checks')
    expect(tables).toContain('check_quantities')
    // children come after their parents
    expect(tables.indexOf('check_quantities')).toBeGreaterThan(
      tables.indexOf('checks'),
    )
  })

  it('deleting cascades locally and undo restores every level', async () => {
    const closure = await captureCascadeClosure(fixture.db, {
      table: 'places',
      rowIdName: 'place_id',
      rowId: placeId,
    })

    // the local delete cascades: all three rows are gone
    await fixture.db.query(`DELETE FROM places WHERE place_id = $1`, [placeId])
    expect(await countWhere('places', 'place_id', placeId)).toBe(0)
    expect(await countWhere('checks', 'check_id', checkId)).toBe(0)
    expect(await countWhere('check_quantities', 'check_quantity_id', quantityId)).toBe(0)

    await undoDeleteRow({
      table: 'places',
      rowIdName: 'place_id',
      rowId: placeId,
      opId: 'test-op',
      closure,
      label: 'cascade roundtrip place',
      time: 1,
    })

    // parent, child and grandchild are restored
    expect(await countWhere('places', 'place_id', placeId)).toBe(1)
    expect(await countWhere('checks', 'check_id', checkId)).toBe(1)
    expect(await countWhere('check_quantities', 'check_quantity_id', quantityId)).toBe(1)

    // compensating insert ops are queued for sync (parent + both children;
    // single-row levels enqueue as insert, not insertMany)
    const insertOps = store
      .get(operationsQueueAtom)
      .filter((o) => o.operation === 'insert' || o.operation === 'insertMany')
    const insertTables = insertOps.map((o) => o.table)
    expect(insertTables).toContain('places')
    expect(insertTables).toContain('checks')
    expect(insertTables).toContain('check_quantities')
  })
})
