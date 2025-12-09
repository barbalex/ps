import { store, postgrestClientAtom } from '../store.ts'
// const postgrestClient = store.get(postgrestClientAtom)

export const executeOperation = async (o) => {
  if (!o) return

  const username = 'TODO: extract from auth'

  const {
    id,
    time,
    table,
    rowIdName,
    rowId,
    operation,
    column,
    newValue,
    postgrestClient,
  } = o

  console.log('executeOperation', {
    id,
    time,
    table,
    rowIdName,
    rowId,
    operation,
    column,
    newValue,
    postgrestClient,
    postgrestClientAtom,
  })

  if (operation === 'update') {
    const { error } = await postgrestClient
      .from(table)
      .update({
        [column]: newValue,
        // updated_at: time,
        updated_by: username,
      })
      .eq(rowIdName, rowId)

    if (error) throw error
  }
  if (operation === 'insert') {
    const { error } = await postgrestClient.from(table).insert({
      [rowIdName]: rowId,
      created_at: time,
      updated_at: time,
      updated_by: username,
    })
  }
  if (operation === 'delete') {
    const { error } = await postgrestClient
      .from(table)
      .delete()
      .eq(rowIdName, rowId)
  }
}
