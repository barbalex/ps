export const generateActionValueLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(action_values)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE action_values ADD COLUMN label text GENERATED ALWAYS AS (action_value_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS action_values_label_idx ON action_values(label)',
    })
  }
  // console.log('LabelGenerator, action_values:', {
  //   columns,
  //   hasLabel,
  // })
}
