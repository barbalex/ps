export const generateSubprojectUserLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(subproject_users)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE subproject_users ADD COLUMN label text GENERATED ALWAYS AS (subproject_user_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS subproject_users_label_idx ON subproject_users(label)',
    })
  }
  // console.log('LabelGenerator, subproject_users:', {
  //   columns,
  //   hasLabel,
  // })
}
