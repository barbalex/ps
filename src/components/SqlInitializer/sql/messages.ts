export const generateMessageLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(messages)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE messages ADD COLUMN label text GENERATED ALWAYS AS (strftime("%Y.%m.%d %H:%M:%S", date));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS messages_label_idx ON messages(label)',
    })
    console.log('generated message labels')
  }
}
