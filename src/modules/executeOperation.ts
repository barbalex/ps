import { store, postgrestClientAtom, addNotificationAtom } from '../store.ts'

export const executeOperation = async (o) => {
  if (!o) return

  const username = 'TODO: extract username from auth'
  const postgrestClient = store.get(postgrestClientAtom)
  if (!postgrestClient) {
    console.warn('No PostgREST client available')
    store.set(addNotificationAtom, {
      intent: 'warning',
      title: 'No database connection',
      body: 'Cannot execute queued operation because there is no database connection.',
    })
    return
  }
  let queryFunction

  const {
    id,
    time,
    table,
    operation,
    rowIdName,
    rowId,
    filter,
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

  // filter example:
  // filter: {
  //   function: 'eq',
  //   column: 'project_id',
  //   value: projectId,
  // }

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
      : filter.function === 'neq' ?
        baseQueryFunction.neq(filter.column, filter.value)
      : filter.function === 'in' ?
        baseQueryFunction.in(filter.column, filter.value)
      : baseQueryFunction
    const { error } = await queryFunction

    if (error) throw error
  }
  if (operation === 'upsert') {
    // enable passing rowId and column as part of draft
    const { error } = await postgrestClient.from(table).upsert({
      ...(rowIdName && rowId ? { [rowIdName]: rowId } : {}),
      ...(column ? { [column]: newValue } : {}),
      ...draft,
      updated_at: time,
      updated_by: username,
    })

    if (error) throw error
  }
  if (operation === 'insert') {
    // enable passing rowId as part of draft
    const { error } = await postgrestClient.from(table).insert({
      ...(rowIdName && rowId ? { [rowIdName]: rowId } : {}),
      ...draft,
      created_at: time,
      updated_at: time,
      updated_by: username,
    })

    if (error) throw error
  }
  if (operation === 'insertMany') {
    const { error } = await postgrestClient.from(table).insert(
      draft.map((d) => ({
        ...d,
        created_at: time,
        updated_at: time,
        updated_by: username,
      })),
    )

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
      : filter.function === 'neq' ?
        baseQueryFunction.neq(filter.column, filter.value)
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
