export const generateUnitLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(units)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE units ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, unit_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS units_label_idx ON units(label)',
    })
    console.log('generated unit labels')
  }
}
