export const generateSubprojectReportLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(subproject_reports)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE subproject_reports ADD COLUMN label text GENERATED ALWAYS AS (coalesce(year, subproject_report_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS subproject_reports_label_idx ON subproject_reports(label)',
    })
  }
  // drop label_replace_by_generated_column if it exists
  const hasLabelReplaceByGeneratedColumn = columns.some(
    (column) => column.name === 'label_replace_by_generated_column',
  )
  if (hasLabelReplaceByGeneratedColumn) {
    const result = await db.unsafeExec({
      sql: 'ALTER TABLE subproject_reports drop COLUMN label_replace_by_generated_column;',
    })
    console.log(
      'LabelGenerator, subproject_reports_label, result from dropping label_replace_by_generated_column:',
      result,
    )
  }
}
