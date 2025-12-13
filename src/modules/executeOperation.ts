import { store, postgrestClientAtom } from '../store.ts'

export const executeOperation = async (o) => {
  if (!o) return

  const username = 'TODO: extract username from auth'
  const postgrestClient = store.get(postgrestClientAtom)

  const {
    id,
    time,
    table,
    rowIdName,
    rowId,
    operation,
    draft = {},
    column,
    newValue,
  } = o

  // console.log('executeOperation', {
  //   id,
  //   time,
  //   table,
  //   rowIdName,
  //   rowId,
  //   operation,
  //   column,
  //   newValue,
  // })

  if (operation === 'update') {
    const { error } = await postgrestClient
      .from(table)
      .update({
        [column]: newValue,
        ...draft,
        updated_at: time,
        updated_by: username,
      })
      .eq(rowIdName, rowId)

    if (error) throw error
  }
  if (operation === 'insert') {
    const { error } = await postgrestClient.from(table).insert({
      [rowIdName]: rowId,
      ...draft,
      created_at: time,
      updated_at: time,
      updated_by: username,
    })

    if (error) throw error
  }
  if (operation === 'delete') {
    const { error } = await postgrestClient
      .from(table)
      .delete()
      .eq(rowIdName, rowId)

    if (error) throw error
  }
  if (operation === 'deleteAll') {
    const { error } = await postgrestClient.from(table).delete()

    if (error) throw error
  }

  return
}
