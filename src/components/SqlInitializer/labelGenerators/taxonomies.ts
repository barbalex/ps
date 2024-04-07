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
  // drop label_replace_by_generated_column if it exists
  const hasLabelReplaceByGeneratedColumn = columns.some(
    (column) => column.name === 'label_replace_by_generated_column',
  )
  if (hasLabelReplaceByGeneratedColumn) {
    const result = await db.unsafeExec({
      sql: 'ALTER TABLE taxonomies drop COLUMN label_replace_by_generated_column;',
    })
    console.log(
      'LabelGenerator, taxonomies_label, result from dropping label_replace_by_generated_column:',
      result,
    )
  }
}
