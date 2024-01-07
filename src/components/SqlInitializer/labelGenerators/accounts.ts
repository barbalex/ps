export const generateAccountLabel = async (db) => {
  const columns = await db.raw({
    sql: 'PRAGMA table_xinfo(accounts)',
  })
  const hasLabel = columns.some((column) => column.name === 'label')
  if (!hasLabel) {
    await db.raw({
      sql: 'ALTER TABLE accounts ADD COLUMN label text GENERATED ALWAYS AS (account_id)',
    })
    await db.raw({
      sql: 'CREATE INDEX IF NOT EXISTS accounts_label_idx ON accounts(label)',
    })
  }
  // console.log('LabelGenerator, accounts:', {
  //   columns,
  //   hasLabel,
  //   indexes,
  // })
}
