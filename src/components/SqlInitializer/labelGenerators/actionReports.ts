export const generateActionReportLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(action_reports)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE action_reports ADD COLUMN label text GENERATED ALWAYS AS (coalesce(year, action_report_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS action_reports_label_idx ON action_reports(label)',
    })
  }
  const hasLabelReplaceByGeneratedColumn = columns.some(
    (column) => column.name === 'label_replace_by_generated_column',
  )
  if (hasLabelReplaceByGeneratedColumn) {
    const result = await db.unsafeExec({
      sql: 'ALTER TABLE action_reports drop COLUMN label_replace_by_generated_column;',
    })
    console.log(
      'LabelGenerator, action_reports_label, result from dropping label_replace_by_generated_column:',
      result,
    )
  }
}
