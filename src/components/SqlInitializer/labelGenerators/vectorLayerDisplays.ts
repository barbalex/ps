export const generateVectorLayerDisplayLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(vector_layer_displays)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `ALTER TABLE vector_layer_displays ADD COLUMN label text GENERATED ALWAYS AS (coalesce(display_property_value, 'Single Display'))`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS vector_layer_displays_label_idx ON vector_layer_displays(label)',
    })
  }
}
