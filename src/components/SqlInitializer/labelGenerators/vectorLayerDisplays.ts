export const generateVectorLayerDisplayLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(vector_layer_displays)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE vector_layer_displays ADD COLUMN label text GENERATED ALWAYS AS (coalesce(display_property_value, 'Single Display'));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS vector_layer_displays_label_idx ON vector_layer_displays(label)',
    })
  }
  // drop label_replace_by_generated_column if it exists
  const hasLabelReplaceByGeneratedColumn = columns.some(
    (column) => column.name === 'label_replace_by_generated_column',
  )
  if (hasLabelReplaceByGeneratedColumn) {
    const result = await db.unsafeExec({
      sql: 'ALTER TABLE vector_layer_displays drop COLUMN label_replace_by_generated_column;',
    })
    console.log(
      'LabelGenerator, vector_layer_displays_label, result from dropping label_replace_by_generated_column:',
      result,
    )
  }
}
