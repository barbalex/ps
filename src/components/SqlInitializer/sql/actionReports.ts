export const generateActionReportLabel = async (db) => {
  // const columns = await db.rawQuery({
  //   sql: 'PRAGMA table_xinfo(action_reports)',
  // })
  // for PostgreSQL:
  const columns = await db.rawQuery({
    sql: `SELECT column_name AS name FROM information_schema.columns WHERE table_name = 'action_reports';`,
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    try {
      await db.unsafeExec({
        sql: `ALTER TABLE action_reports ADD COLUMN label text GENERATED ALWAYS AS (coalesce(year::text, action_report_id::text)) stored;`,
      })
    } catch (e) {
      // error when generating label: error: expected one dependency record for TOAST table, found 4
      // https://github.com/electric-sql/pglite/issues/83#issuecomment-2149608677
      return console.error(
        'SqlInitializer: generateActionReportLabel error when generating label:',
        e,
      )
    }
    // error: expected one dependency record for TOAST table, found 4
    console.log('SqlInitializer: generateActionReportLabel 2')
    try {
      await db.unsafeExec({
        sql: 'CREATE INDEX IF NOT EXISTS action_reports_label_idx ON action_reports(label)',
      })
    } catch (e) {
      console.error(
        'SqlInitializer: generateActionReportLabel error when indexing label:',
        e,
      )
    }
    console.log('SqlInitializer: generateActionReportLabel 3')
    console.log('generated action report labels')
  }
}
