// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generateObservationLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(observations)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    const result = await db.raw({
      sql: `ALTER TABLE observations ADD COLUMN label text GENERATED ALWAYS AS (coalesce(concat(date, ': ', author), observation_id))`,
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS observations_label_idx ON observations(label)',
    })
    console.log('LabelGenerator, observations, result:', result)
  }
}
