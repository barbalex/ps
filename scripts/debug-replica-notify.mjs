// Demonstrates whether live-query notifications fire under
// session_replication_role = 'replica' (as ensurePgliteDb sets)
import { PGlite } from '@electric-sql/pglite'
import { live } from '@electric-sql/pglite/live'

const run = async (label, replicaMode) => {
  const db = await PGlite.create({
    extensions: { live },
  })
  await db.exec('CREATE TABLE t (id text primary key)')
  if (replicaMode) await db.exec("SET session_replication_role = 'replica'")

  let updates = 0
  const q = await db.live.query('SELECT * FROM t', [], () => {
    updates++
  })
  console.log(`${label}: initial rows = ${q.initialResults.rows.length}`)

  await db.exec("INSERT INTO t VALUES ('a')")
  await new Promise((r) => setTimeout(r, 300))
  console.log(
    `${label}: after insert: rows=${(await db.query('SELECT * FROM t')).rows.length}, live-updates=${updates}`,
  )
  await q.unsubscribe()
  await db.close()
}

await run('origin-mode   ', false)
await run('replica-mode  ', true)
