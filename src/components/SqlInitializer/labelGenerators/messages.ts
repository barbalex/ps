export const generateMessageLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(messages)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    const result = await db.unsafeExec({
      sql: `
        ALTER TABLE messages ADD COLUMN label text GENERATED ALWAYS AS (strftime("%Y.%m.%d %H:%M:%S", date));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS messages_label_idx ON messages(label)',
    })
    console.log('LabelGenerator, messages, result:', result)
  }
  // drop label_replace_by_generated_column if it exists
  // const hasLabelReplaceByGeneratedColumn = columns.some(
  //   (column) => column.name === 'label_replace_by_generated_column',
  // )
  // if (hasLabelReplaceByGeneratedColumn) {
  //   const result = await db.unsafeExec({
  //     sql: 'ALTER TABLE messages drop COLUMN label_replace_by_generated_column;',
  //   })
  //   console.log(
  //     'LabelGenerator, messages_label, result from dropping label_replace_by_generated_column:',
  //     result,
  //   )
  // }
}
