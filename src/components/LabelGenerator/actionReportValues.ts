export const generateActionReportValueLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(action_report_values)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE action_report_values ADD COLUMN label text GENERATED ALWAYS AS (action_report_value_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS action_report_values_label_idx ON action_report_values(label)',
    })
  }
  // console.log('LabelGenerator, action_report_values:', {
  //   columns,
  //   hasLabel,
  // })
}
