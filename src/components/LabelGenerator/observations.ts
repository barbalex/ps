export const generateObservationLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(observations)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE observations ADD COLUMN label text GENERATED ALWAYS AS (observation_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS observations_label_idx ON observations(label)',
    })
  }
  // console.log('LabelGenerator, observations:', {
  //   columns,
  //   hasLabel,
  // })
}
