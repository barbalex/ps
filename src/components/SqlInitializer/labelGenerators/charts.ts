export const generateChartLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(charts)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE charts ADD COLUMN label text GENERATED ALWAYS AS (coalesce(title, chart_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS charts_label_idx ON charts(label)',
    })
  }
  // drop label_replace_by_generated_column if it exists
  const hasLabelReplaceByGeneratedColumn = columns.some(
    (column) => column.name === 'label_replace_by_generated_column',
  )
  if (hasLabelReplaceByGeneratedColumn) {
    const result = await db.unsafeExec({
      sql: 'ALTER TABLE charts drop COLUMN label_replace_by_generated_column;',
    })
    console.log(
      'LabelGenerator, charts_label, result from dropping label_replace_by_generated_column:',
      result,
    )
  }
}
