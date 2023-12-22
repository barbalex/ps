export const generateGoalReportValueLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(goal_report_values)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: `ALTER TABLE goal_report_values ADD COLUMN label text GENERATED ALWAYS AS (goal_report_value_id)`,
      // subqueries are not possible in generated columns...
      // sql: `ALTER TABLE goal_report_values ADD COLUMN label text GENERATED ALWAYS AS (iif(coalesce(unit_id, value_integer, value_numeric, value_text) is not null, select label from units u where u.unit_id = unit_id || ':' || coalesce(value_integer, value_numeric, value_text), goal_report_value_id))`,
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS goal_report_values_label_idx ON goal_report_values(label)',
    })
  }
  // console.log('LabelGenerator, goal_report_values:', {
  //   columns,
  //   hasLabel,
  // })
}
