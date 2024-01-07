export const generateTaxonLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(taxa)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE taxa ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, taxon_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS taxa_label_idx ON taxa(label)',
    })
  }
  // console.log('LabelGenerator, taxa:', {
  //   columns,
  //   hasLabel,
  // })
}
