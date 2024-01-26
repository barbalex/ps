export const generateObservationLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(observations)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    const result = await db.unsafeExec({
      sql: `ALTER TABLE observations ADD COLUMN label text GENERATED ALWAYS AS (coalesce(concat(date, ': ', author), observation_id))`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS observations_label_idx ON observations(label)',
    })
    console.log('LabelGenerator, observations, result:', result)
  }
}
