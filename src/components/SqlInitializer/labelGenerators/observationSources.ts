export const generateObservationSourceLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(observation_sources)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE observation_sources ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, observation_source_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS observation_sources_label_idx ON observation_sources(label)',
    })
  }
}
