export const generatePlaceUserLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(place_users)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE place_users ADD COLUMN label text GENERATED ALWAYS AS (place_user_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS place_users_label_idx ON place_users(label)',
    })
  }
  // console.log('LabelGenerator, place_users:', {
  //   columns,
  //   hasLabel,
  // })
}
