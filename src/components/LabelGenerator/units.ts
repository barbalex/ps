export const generateUnitLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(units)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE units ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, unit_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS units_label_idx ON units(label)',
    })
  }
  // console.log('LabelGenerator, units:', {
  //   columns,
  //   hasLabel,
  // })
}
