export const generateListValueLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(list_values)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE list_values ADD COLUMN label text GENERATED ALWAYS AS (coalesce(value, list_value_id));
        ALTER TABLE list_values drop COLUMN label_replace_by_generated_column;`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS list_values_label_idx ON list_values(label)',
    })
  }
}
