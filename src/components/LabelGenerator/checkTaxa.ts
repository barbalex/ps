export const generateCheckTaxonLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(check_taxa)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE check_taxa ADD COLUMN label text GENERATED ALWAYS AS (check_taxon_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS check_taxa_label_idx ON check_taxa(label)',
    })
  }
  // console.log('LabelGenerator, check_taxa:', {
  //   columns,
  //   hasLabel,
  // })
}
