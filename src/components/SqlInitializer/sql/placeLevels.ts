export const generatePlaceLevelLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(place_levels)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE place_levels ADD COLUMN label text GENERATED ALWAYS AS (coalesce(CAST(level as VARCHAR) || '.' || coalesce(name_short, name_plural, place_level_id), place_level_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS place_levels_label_idx ON place_levels(label)',
    })
    console.log('generated place level labels')
  }
}
