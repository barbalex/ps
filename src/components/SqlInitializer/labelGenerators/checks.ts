// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generateCheckLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(checks)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE checks ADD COLUMN label text GENERATED ALWAYS AS (coalesce(date, check_id))',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS checks_label_idx ON checks(label)',
    })
  }
  // console.log('LabelGenerator, checks:', {
  //   columns,
  //   hasLabel,
  // })
}
