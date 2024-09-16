export const generateCrsLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(crs)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE crs ADD COLUMN label text GENERATED ALWAYS AS (coalesce(code, crs_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS crs_label_idx ON crs(label)',
    })
    console.log('generated crs labels')
  }
}
