export const generateListLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(lists)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE lists ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, list_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS lists_label_idx ON lists(label)',
    })
  }
  // console.log('LabelGenerator, lists:', {
  //   columns,
  //   hasLabel,
  // })
}
