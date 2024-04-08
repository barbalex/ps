export const generateTaxonomyLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(taxonomies)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE taxonomies ADD COLUMN label text GENERATED ALWAYS AS (coalesce(concat(name, ' (', type, ')'), taxonomy_id));`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS taxonomies_label_idx ON taxonomies(label)',
    })
  }
}
