export const generatePersonLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(persons)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE persons ADD COLUMN label text GENERATED ALWAYS AS (coalesce(email, person_id));
        ALTER TABLE persons drop COLUMN label_replace_by_generated_column;`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS persons_label_idx ON persons(label)',
    })
  }
}
