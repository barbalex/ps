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
    throw new Error('No PostgREST client available')
  }

  const {
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
      // if table = users, do not set updated_by (does not exist)
      ...(table !== 'users' ? { updated_by: username } : {}),
    })
    // add filtering
    const queryFunction =
      rowIdName && rowId
        ? baseQueryFunction.eq(rowIdName, rowId).select(rowIdName).limit(1)
        : filter?.function === 'eq'
          ? baseQueryFunction.eq(filter.column, filter.value)
          : filter?.function === 'neq'
            ? baseQueryFunction.neq(filter.column, filter.value)
            : filter?.function === 'in'
              ? baseQueryFunction.in(filter.column, filter.value)
              : baseQueryFunction
    const { data, error } = await queryFunction

    if (error) throw error

    if (rowIdName && rowId && Array.isArray(data) && data.length === 0) {
      throw new Error(
        `Update matched 0 rows for ${table}.${rowIdName}=${rowId}`,
      )
    }
  }
  if (operation === 'upsert') {
    // enable passing rowId and column as part of draft
    const { error } = await postgrestClient.from(table).upsert({
      ...(rowIdName && rowId ? { [rowIdName]: rowId } : {}),
      ...(column ? { [column]: newValue } : {}),
      ...draft,
      updated_at: time,
      // if table = users, do not set updated_by (does not exist)
      ...(table !== 'users' ? { updated_by: username } : {}),
    })

    if (error) throw error
  }
  if (operation === 'upsertMany') {
    const rows = Array.isArray(draft) ? draft : []
    if (rows.length === 0) return

    const { error } = await postgrestClient.from(table).upsert(
      rows.map((d) => ({
        ...d,
        created_at: time,
        updated_at: time,
        ...(table !== 'users' ? { updated_by: username } : {}),
      })),
    )

    if (error) throw error
  }
  if (operation === 'insert') {
    // enable passing rowId as part of draft
    const { error } = await postgrestClient.from(table).insert({
      ...(rowIdName && rowId ? { [rowIdName]: rowId } : {}),
      ...draft,
      created_at: time,
      updated_at: time,
      // if table = users, do not set updated_by (does not exist)
      ...(table !== 'users' ? { updated_by: username } : {}),
    })

    if (error) throw error
  }
  if (operation === 'insertMany') {
    const { error } = await postgrestClient.from(table).insert(
      draft.map((d) => ({
        ...d,
        created_at: time,
        updated_at: time,
        // if table = users, do not set updated_by (does not exist)
        ...(table !== 'users' ? { updated_by: username } : {}),
      })),
    )

    if (error) throw error
  }
  if (operation === 'delete') {
    // build base query
    const baseQueryFunction = postgrestClient.from(table).delete()
    // add filtering
    const queryFunction =
      rowIdName && rowId
        ? baseQueryFunction.eq(rowIdName, rowId)
        : filter?.function === 'eq'
          ? baseQueryFunction.eq(filter.column, filter.value)
          : filter?.function === 'neq'
            ? baseQueryFunction.neq(filter.column, filter.value)
            : filter?.function === 'in'
              ? baseQueryFunction.in(filter.column, filter.value)
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
