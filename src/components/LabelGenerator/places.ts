export const generatePlaceLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(places)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    // TODO: build virtual field from data.label_by, return that here
    await db.raw({
      sql: 'ALTER TABLE places ADD COLUMN label text GENERATED ALWAYS AS (place_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS places_label_idx ON places(label)',
    })
  }
  // console.log('LabelGenerator, places:', {
  //   columns,
  //   hasLabel,
  // })
}
