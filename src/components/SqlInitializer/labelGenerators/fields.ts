// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generateFieldLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(fields)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: `ALTER TABLE fields ADD COLUMN label text GENERATED ALWAYS AS (iif(coalesce(table_name, name) is not null, table_name || '.' || name, field_id))`,
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS fields_label_idx ON fields(label)',
    })
  }
  // console.log('LabelGenerator, fields:', {
  //   columns,
  //   hasLabel,
  // })
}
