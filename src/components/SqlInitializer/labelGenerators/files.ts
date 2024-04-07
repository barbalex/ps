export const generateFileLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(files)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE files ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, file_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS files_label_idx ON files(label)',
    })
  }
  // drop label_replace_by_generated_column if it exists
  const hasLabelReplaceByGeneratedColumn = columns.some(
    (column) => column.name === 'label_replace_by_generated_column',
  )
  if (hasLabelReplaceByGeneratedColumn) {
    const result = await db.unsafeExec({
      sql: 'ALTER TABLE files drop COLUMN label_replace_by_generated_column;',
    })
    console.log(
      'LabelGenerator, files_label, result from dropping label_replace_by_generated_column:',
      result,
    )
  }
}
