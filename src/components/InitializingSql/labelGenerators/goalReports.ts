export const generateGoalReportLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(goal_reports)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE goal_reports ADD COLUMN label text GENERATED ALWAYS AS (goal_report_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS goal_reports_label_idx ON goal_reports(label)',
    })
  }
  // console.log('LabelGenerator, goal_reports:', {
  //   columns,
  //   hasLabel,
  // })
}
