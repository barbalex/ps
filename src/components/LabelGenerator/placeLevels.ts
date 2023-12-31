export const generatePlaceLevelLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(place_levels)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: `ALTER TABLE place_levels ADD COLUMN label text GENERATED ALWAYS AS (coalesce(level || ': ' || name_short, place_level_id))`,
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS place_levels_label_idx ON place_levels(label)',
    })
  }
  // console.log('LabelGenerator, place_levels:', {
  //   columns,
  //   hasLabel,
  // })
}
