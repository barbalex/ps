export const generateProjectReportLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(project_reports)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE project_reports ADD COLUMN label text GENERATED ALWAYS AS (coalesce(year, project_report_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS project_reports_label_idx ON project_reports(label)',
    })
  }
  // console.log('LabelGenerator, project_reports:', {
  //   columns,
  //   hasLabel,
  // })
}
