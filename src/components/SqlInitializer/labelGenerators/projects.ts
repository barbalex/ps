export const generateProjectLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(projects)',
  })
  // const indexes = await db.raw({
  //   sql: 'PRAGMA index_list(projects)',
  // })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE projects ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, project_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS projects_label_idx ON projects(label)',
    })
  }
  // console.log('LabelGenerator, projects:', {
  //   columns,
  //   hasLabel,
  //   indexes,
  // })
}
