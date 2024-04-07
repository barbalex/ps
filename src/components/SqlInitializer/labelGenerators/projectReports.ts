export const generateProjectReportLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(project_reports)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE project_reports ADD COLUMN label text GENERATED ALWAYS AS (coalesce(year, project_report_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS project_reports_label_idx ON project_reports(label)',
    })
  }
  // drop label_replace_by_generated_column if it exists
  const hasLabelReplaceByGeneratedColumn = columns.some(
    (column) => column.name === 'label_replace_by_generated_column',
  )
  if (hasLabelReplaceByGeneratedColumn) {
    const result = await db.unsafeExec({
      sql: 'ALTER TABLE project_reports drop COLUMN label_replace_by_generated_column;',
    })
    console.log(
      'LabelGenerator, project_reports_label, result from dropping label_replace_by_generated_column:',
      result,
    )
  }
}
