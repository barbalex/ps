import { PGlite } from '@electric-sql/pglite'
import { electricSync } from '@electric-sql/pglite-sync'
import { MultiShapeStream } from '@electric-sql/experimental'
import { expect, it, vi } from 'vitest'

// Drive the installed adapter's subscriber; only the network is synthetic.
it.each([true, false])('only checkpoints an entirely committed stage (valid parent: %s)', async valid => {
  const db = await PGlite.create({ extensions: { electric: electricSync() } })
  const subscribe = vi.spyOn(MultiShapeStream.prototype, 'subscribe')
  const onInitialSync = vi.fn()
  const onError = vi.fn()
  try {
    await db.exec(`CREATE TABLE checks (id integer primary key);
      CREATE TABLE check_taxa (id integer primary key, parent integer references checks);
      CREATE TABLE other (id integer primary key);
      INSERT INTO checks VALUES (1)`)
    const shapes = Object.fromEntries(['check_taxa', 'other'].map(table => [table, {
      table, primaryKey: ['id'],
      shape: { url: 'http://localhost/shape', fetchClient: () => new Promise<Response>(() => undefined) },
    }]))
    const sync = await db.electric.syncShapesToTables({ key: 'stage', shapes, onInitialSync, onError })
    const deliver = subscribe.mock.calls[0][0]
    // Both streams have seen changes, but only one has finished its snapshot.
    await deliver([{
      shape: 'check_taxa', key: '2', value: { id: 2, parent: valid ? 1 : 99 },
      headers: { operation: 'insert', lsn: '1', last: true },
    }, { shape: 'check_taxa', headers: { control: 'up-to-date', global_last_seen_lsn: '2' } }])
    await deliver([{
      shape: 'other', key: '3', value: { id: 3 },
      headers: { operation: 'insert', lsn: '1', last: true },
    }])
    expect((await db.query('SELECT * FROM other')).rows).toEqual([])
    const finish = deliver([{ shape: 'other', headers: { control: 'up-to-date', global_last_seen_lsn: '2' } }])
    const later = deliver([{ shape: 'other', headers: { control: 'up-to-date', global_last_seen_lsn: '3' } }])
    await Promise.all([finish, later])
    expect(onInitialSync).toHaveBeenCalledTimes(valid ? 1 : 0)
    expect(onError).toHaveBeenCalledTimes(valid ? 0 : 1)
    if (!valid) expect(onError.mock.calls[0][0].message).toContain('foreign key constraint')
    expect((await db.query('SELECT id FROM check_taxa')).rows).toEqual(valid ? [{ id: 2 }] : [])
    expect((await db.query('SELECT key FROM electric.subscriptions_metadata')).rows).toEqual(valid ? [{ key: 'stage' }] : [])
    sync.unsubscribe()
  } finally {
    subscribe.mockRestore()
    await db.close()
  }
})
