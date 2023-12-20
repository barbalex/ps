export const generateProjectUserLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(project_users)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE project_users ADD COLUMN label text GENERATED ALWAYS AS (roject_user_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS project_users_label_idx ON project_users(label)',
    })
  }
  // console.log('LabelGenerator, project_users:', {
  //   columns,
  //   hasLabel,
  // })
}
