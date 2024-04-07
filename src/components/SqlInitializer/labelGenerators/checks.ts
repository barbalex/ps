export const generateCheckLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(checks)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE checks ADD COLUMN label text GENERATED ALWAYS AS (coalesce(date, check_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS checks_label_idx ON checks(label)',
    })
  }
  // drop label_replace_by_generated_column if it exists
  const hasLabelReplaceByGeneratedColumn = columns.some(
    (column) => column.name === 'label_replace_by_generated_column',
  )
  if (hasLabelReplaceByGeneratedColumn) {
    const result = await db.unsafeExec({
      sql: 'ALTER TABLE checks drop COLUMN label_replace_by_generated_column;',
    })
    console.log(
      'LabelGenerator, checks_label, result from dropping label_replace_by_generated_column:',
      result,
    )
  }
}
