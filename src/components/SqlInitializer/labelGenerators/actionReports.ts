// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generateActionReportLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(action_reports)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE action_reports ADD COLUMN label text GENERATED ALWAYS AS (coalesce(year, action_report_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS action_reports_label_idx ON action_reports(label)',
    })
  }
  // console.log('LabelGenerator, action_reports:', {
  //   columns,
  //   hasLabel,
  // })
}
