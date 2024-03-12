export const generateSubprojectLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(subprojects)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE subprojects ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, subproject_id));
        ALTER TABLE subprojects drop COLUMN label_replace_by_generated_column;`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS subprojects_label_idx ON subprojects(label)',
    })
  }
}
