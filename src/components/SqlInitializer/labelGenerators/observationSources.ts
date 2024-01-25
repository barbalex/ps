// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generateObservationSourceLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(observation_sources)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE observation_sources ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, observation_source_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS observation_sources_label_idx ON observation_sources(label)',
    })
  }
  // console.log('LabelGenerator, observation_sources:', {
  //   columns,
  //   hasLabel,
  // })
}
