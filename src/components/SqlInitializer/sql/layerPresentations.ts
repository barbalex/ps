export const generateLayerPresentationLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(layer_presentations)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE layer_presentations ADD COLUMN label text GENERATED ALWAYS AS (layer_presentation_id);`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS vector_layer_displays_label_idx ON layer_presentations(label)',
    })
    console.log('generated layer presentation labels')
  }
}
