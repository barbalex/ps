export const generateProjectCrsLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(project_crs)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE project_crs ADD COLUMN label text GENERATED ALWAYS AS (coalesce(code, project_crs_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS project_crs_label_idx ON project_crs(label)',
    })
    console.log('generated project_crs labels')
  }
}
