export const generatePlaceReportLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(place_reports)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE place_reports ADD COLUMN label text GENERATED ALWAYS AS (coalesce(year, place_report_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS place_reports_label_idx ON place_reports(label)',
    })
    console.log('generated place report labels')
  }
}
