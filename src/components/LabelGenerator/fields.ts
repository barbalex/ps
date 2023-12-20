export const generateFieldLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(fields)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE fields ADD COLUMN label text GENERATED ALWAYS AS (field_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS fields_label_idx ON fields(label)',
    })
  }
  // console.log('LabelGenerator, fields:', {
  //   columns,
  //   hasLabel,
  // })
}
