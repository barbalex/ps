// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generateFieldTypeLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(field_types)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE field_types ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, field_type_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS field_types_label_idx ON field_types(label)',
    })
  }
  // console.log('LabelGenerator, field_types:', {
  //   columns,
  //   hasLabel,
  // })
}
