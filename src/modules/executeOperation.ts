import { store, postgrestClientAtom } from '../store.ts'

export const executeOperation = async (o) => {
  if (!o) return

  const username = 'TODO: extract username from auth'
  const postgrestClient = store.get(postgrestClientAtom)
  let queryFunction

  const {
    id,
    time,
    table,
    rowIdName,
    rowId,
    filter,
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
    // build base query
    const baseQueryFunction = postgrestClient.from(table).update({
      [column]: newValue,
      ...draft,
      updated_at: time,
      updated_by: username,
    })
    // add filtering
    const queryFunction =
      rowIdName && rowId ? baseQueryFunction.eq(rowIdName, rowId)
      : filter.function === 'eq' ?
        baseQueryFunction.eq(filter.column, filter.value)
      : filter.function === 'in' ?
        baseQueryFunction.in(filter.column, filter.value)
      : baseQueryFunction
    const { error } = await queryFunction

    if (error) throw error
  }
  if (operation === 'upsert') {
    const { error } = await postgrestClient.from(table).upsert({
      [rowIdName]: rowId,
      [column]: newValue,
      ...draft,
      updated_at: time,
      updated_by: username,
    })

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
    // build base query
    const baseQueryFunction = postgrestClient.from(table).delete()
    // add filtering
    const queryFunction =
      rowIdName && rowId ? baseQueryFunction.eq(rowIdName, rowId)
      : filter.function === 'eq' ?
        baseQueryFunction.eq(filter.column, filter.value)
      : filter.function === 'in' ?
        baseQueryFunction.in(filter.column, filter.value)
      : baseQueryFunction
    const { error } = await queryFunction

    if (error) throw error
  }
  if (operation === 'deleteAll') {
    const { error } = await postgrestClient.from(table).delete()

    if (error) throw error
  }

  return
}
