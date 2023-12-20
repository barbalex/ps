export const generateUserLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(users)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE users ADD COLUMN label text GENERATED ALWAYS AS (coalesce(email, user_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS users_label_idx ON users(label)',
    })
  }
  // console.log('LabelGenerator, users:', {
  //   columns,
  //   hasLabel,
  //   indexes,
  // })
}
