import sql from '../../sql/createPartialIndexes.txt'

export const generatePartialIndexes = async (db) => {
  await db.raw({
    sql,
  })
  // console.log('partialIndexes, result:', result)
}
