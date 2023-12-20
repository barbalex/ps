export const generateListValueLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(list_values)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE list_values ADD COLUMN label text GENERATED ALWAYS AS (coalesce(value, list_value_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS list_values_label_idx ON list_values(label)',
    })
  }
  // console.log('LabelGenerator, list_values:', {
  //   columns,
  //   hasLabel,
  // })
}
