export const generateWidgetTypeLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(widget_types)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE widget_types ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, widget_type_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS widget_types_label_idx ON widget_types(label)',
    })
  }
}
