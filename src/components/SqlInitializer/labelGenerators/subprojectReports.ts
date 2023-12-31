export const generateSubprojectReportLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(subproject_reports)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE subproject_reports ADD COLUMN label text GENERATED ALWAYS AS (coalesce(year, subproject_report_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS subproject_reports_label_idx ON subproject_reports(label)',
    })
  }
  // console.log('LabelGenerator, subproject_reports:', {
  //   columns,
  //   hasLabel,
  // })
}
