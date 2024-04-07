export const generatePersonLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(persons)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE persons ADD COLUMN label text GENERATED ALWAYS AS (coalesce(email, person_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS persons_label_idx ON persons(label)',
    })
  }
  // drop label_replace_by_generated_column if it exists
  const hasLabelReplaceByGeneratedColumn = columns.some(
    (column) => column.name === 'label_replace_by_generated_column',
  )
  if (hasLabelReplaceByGeneratedColumn) {
    const result = await db.unsafeExec({
      sql: 'ALTER TABLE persons drop COLUMN label_replace_by_generated_column;',
    })
    console.log(
      'LabelGenerator, persons_label, result from dropping label_replace_by_generated_column:',
      result,
    )
  }
}
