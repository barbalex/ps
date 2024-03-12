export const generateActionLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(actions)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE actions ADD COLUMN label text GENERATED ALWAYS AS (coalesce(date, action_id));
        ALTER TABLE actions drop COLUMN label_replace_by_generated_column;`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS actions_label_idx ON actions(label)',
    })
  }
}
