export const generatePlaceReportValueLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(place_report_values)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE place_report_values ADD COLUMN label text GENERATED ALWAYS AS (place_report_value_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS place_report_values_label_idx ON place_report_values(label)',
    })
  }
  // console.log('LabelGenerator, place_report_values:', {
  //   columns,
  //   hasLabel,
  // })
}
