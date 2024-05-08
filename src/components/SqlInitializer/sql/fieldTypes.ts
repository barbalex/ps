export const generateFieldTypeLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(field_types)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE field_types ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, field_type_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS field_types_label_idx ON field_types(label)',
    })
    console.log('generated field type labels')
  }
}
