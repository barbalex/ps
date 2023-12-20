export const generateActionLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(actions)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE actions ADD COLUMN label text GENERATED ALWAYS AS (coalesce(date, action_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS actions_label_idx ON actions(label)',
    })
  }
  // console.log('LabelGenerator, actions:', {
  //   columns,
  //   hasLabel,
  // })
}
