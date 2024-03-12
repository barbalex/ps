export const generateFieldLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(fields)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE fields ADD COLUMN label text GENERATED ALWAYS AS (iif(coalesce(table_name, name) is not null, table_name || '.' || name, field_id));
        ALTER TABLE fields drop COLUMN label_replace_by_generated_column;`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS fields_label_idx ON fields(label)',
    })
  }
}
