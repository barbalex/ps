export const generateTaxonomyLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(taxonomies)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE taxonomies ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, taxonomy_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS taxonomies_label_idx ON taxonomies(label)',
    })
  }
  // console.log('LabelGenerator, taxonomies:', {
  //   columns,
  //   hasLabel,
  // })
}
