export const generateCheckValueLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(check_values)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE check_values ADD COLUMN label text GENERATED ALWAYS AS (check_value_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS check_values_label_idx ON check_values(label)',
    })
  }
  // console.log('LabelGenerator, check_values:', {
  //   columns,
  //   hasLabel,
  // })
}
