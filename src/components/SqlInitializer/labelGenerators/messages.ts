export const generateMessageLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(messages)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    const result = await db.raw({
      sql: 'ALTER TABLE messages ADD COLUMN label text GENERATED ALWAYS AS (strftime("%Y.%m.%d %H:%M:%S", date))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS messages_label_idx ON messages(label)',
    })
    console.log('LabelGenerator, messages, result:', result)
  }
}
