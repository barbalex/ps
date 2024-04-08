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
  }
  // drop label_replace_by_generated_column if it exists
  // const hasLabelReplaceByGeneratedColumn = columns.some(
  //   (column) => column.name === 'label_replace_by_generated_column',
  // )
  // if (hasLabelReplaceByGeneratedColumn) {
  //   const result = await db.unsafeExec({
  //     sql: 'ALTER TABLE place_levels drop COLUMN label_replace_by_generated_column;',
  //   })
  //   console.log(
  //     'LabelGenerator, place_levels_label, result from dropping label_replace_by_generated_column:',
  //     result,
  //   )
  // }
}
