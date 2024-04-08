export const generateListLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(lists)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE lists ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, list_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS lists_label_idx ON lists(label)',
    })
  }
  // drop label_replace_by_generated_column if it exists
  // const hasLabelReplaceByGeneratedColumn = columns.some(
  //   (column) => column.name === 'label_replace_by_generated_column',
  // )
  // if (hasLabelReplaceByGeneratedColumn) {
  //   const result = await db.unsafeExec({
  //     sql: 'ALTER TABLE lists drop COLUMN label_replace_by_generated_column;',
  //   })
  //   console.log(
  //     'LabelGenerator, lists_label, result from dropping label_replace_by_generated_column:',
  //     result,
  //   )
  // }
}
