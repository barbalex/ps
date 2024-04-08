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
}
