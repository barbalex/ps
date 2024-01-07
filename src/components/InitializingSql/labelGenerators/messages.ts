export const generateMessageLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(messages)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE messages ADD COLUMN label text GENERATED ALWAYS AS (message_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS messages_label_idx ON messages(label)',
    })
  }
  // console.log('LabelGenerator, messages:', {
  //   columns,
  //   hasLabel,
  // })
}
