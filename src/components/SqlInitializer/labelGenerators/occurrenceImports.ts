export const generateOccurrenceImportLabel = async (db) => {
  const columns = await db.rawQuery({
    sql: 'PRAGMA table_xinfo(occurrence_imports)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.unsafeExec({
      sql: `
        ALTER TABLE occurrence_imports ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, occurrence_import_id));
        ALTER TABLE occurrence_imports drop label_replace_by_generated_column;`,
    })
    await db.unsafeExec({
      sql: 'CREATE INDEX IF NOT EXISTS occurrence_imports_label_idx ON occurrence_imports(label)',
    })
  }
}
