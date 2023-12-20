export const generateSubprojectTaxonLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(subproject_taxa)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE subproject_taxa ADD COLUMN label text GENERATED ALWAYS AS (subproject_taxon_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS subproject_taxa_label_idx ON subproject_taxa(label)',
    })
  }
  // console.log('LabelGenerator, subproject_taxa:', {
  //   columns,
  //   hasLabel,
  // })
}
