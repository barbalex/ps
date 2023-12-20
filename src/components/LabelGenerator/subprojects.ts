export const generateSubprojectLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(subprojects)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE subprojects ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, subproject_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS subprojects_label_idx ON subprojects(label)',
    })
  }
  console.log('LabelGenerator, subprojects:', {
    columns,
    hasLabel,
  })
}
