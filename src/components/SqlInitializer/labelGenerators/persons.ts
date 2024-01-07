export const generatePersonLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(persons)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE persons ADD COLUMN label text GENERATED ALWAYS AS (coalesce(email, person_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS persons_label_idx ON persons(label)',
    })
  }
  // console.log('LabelGenerator, persons:', {
  //   columns,
  //   hasLabel,
  // })
}
