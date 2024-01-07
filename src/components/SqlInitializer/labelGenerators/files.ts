export const generateFileLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(files)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE files ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, file_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS files_label_idx ON files(label)',
    })
  }
  // console.log('LabelGenerator, files:', {
  //   columns,
  //   hasLabel,
  // })
}
