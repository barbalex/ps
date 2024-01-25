import sql from '../../sql/createPartialIndexes.txt'

// TODO: db.raw is deprecated in v0.9
// https://electric-sql.com/docs/usage/data-access/queries#raw-sql
// try db.rawQuery instead for reading data
// alternatively use db.unsafeExec(sql): https://electric-sql.com/docs/api/clients/typescript#instantiation
export const generatePartialIndexes = async (db) => {
  await db.raw({
    sql,
  })
  // console.log('partialIndexes, result:', result)
}
