// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generatePlaceReportLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(place_reports)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE place_reports ADD COLUMN label text GENERATED ALWAYS AS (coalesce(year, place_report_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS place_reports_label_idx ON place_reports(label)',
    })
  }
  // console.log('LabelGenerator, place_reports:', {
  //   columns,
  //   hasLabel,
  // })
}
