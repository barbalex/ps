// TODO: seems this is not used for anything useful
export const tableNameFromIdField = async ({ idField, db }): string => {
  const tables = await db.rawQuery({ sql: `PRAGMA table_list` })
  const tableNames = tables.map((row) => row.name)
  const allTableInfos = []
  for (const tableName of tableNames) {
    const fields = await db.rawQuery({ sql: `PRAGMA table_info(${tableName})` })
    allTableInfos.push({
      name: tableName,
      fields,
      pkName: fields.find((field) => field.pk === 1)?.name,
    })
  }
  const pkNameOfTableWithIdField = allTableInfos.find(
    (tableInfo) => tableInfo.pkName === idField,
  )?.name

  if (!pkNameOfTableWithIdField) {
    throw new Error(`Could not find table with primary key field "${idField}"`)
  }

  return pkNameOfTableWithIdField
}
