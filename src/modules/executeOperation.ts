import {
  store,
  postgrestClientAtom,
  addNotificationAtom,
  userEmailAtom,
} from '../store.ts'
import {
  fetchPostgrestToken,
  invalidatePostgrestToken,
} from './fetchPostgrestToken.ts'

export const executeOperation = async (o) => {
  if (!o) return

  const username = store.get(userEmailAtom) ?? 'unknown'
  const token = await fetchPostgrestToken()
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

  // Helper: attach JWT auth header to any query builder that supports setHeader
  const withAuth = <T extends { setHeader: (k: string, v: string) => T }>(
    builder: T,
  ): T => {
    if (token) builder.setHeader('Authorization', `Bearer ${token}`)
    return builder
  }

  // Helper: check error for auth failures and re-throw with enriched message
  const checkError = (
    error: {
      code?: string
      message?: string
    } | null,
  ) => {
    if (!error) return
    const isJwtError =
      error.code === 'PGRST301' ||
      error.code === 'PGRST302' ||
      error.message?.toLowerCase().includes('jwt')
    if (isJwtError) {
      invalidatePostgrestToken()
      throw Object.assign(new Error(`JWT error: ${error.message}`), {
        code: error.code,
      })
    }
    throw error
  }

  const {
    time,
    table,
    operation,
    rowIdName,
    rowId,
    filter,
    filters,
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
  // filters example (multiple AND conditions):
  // filters: [
  //   { function: 'eq', column: 'place_id', value: placeId },
  //   { function: 'eq', column: 'user_id', value: userId },
  // ]

  if (operation === 'update') {
    // build base query
    const baseQueryFunction = withAuth(
      postgrestClient.from(table).update({
        [column]: newValue,
        ...draft,
        updated_at: time,
        // if table = users, do not set updated_by (does not exist)
        ...(table !== 'users' ? { updated_by: username } : {}),
      }),
    )
    // add filtering
    let queryFunction
    if (rowIdName && rowId) {
      queryFunction = baseQueryFunction
        .eq(rowIdName, rowId)
        .select(rowIdName)
        .limit(1)
    } else if (filters?.length) {
      // compound filter: chain multiple eq/neq/in conditions
      queryFunction = filters.reduce((q, f) => {
        if (f.function === 'eq') return q.eq(f.column, f.value)
        if (f.function === 'neq') return q.neq(f.column, f.value)
        if (f.function === 'in') return q.in(f.column, f.value)
        return q
      }, baseQueryFunction)
    } else if (filter?.function === 'eq') {
      queryFunction = baseQueryFunction.eq(filter.column, filter.value)
    } else if (filter?.function === 'neq') {
      queryFunction = baseQueryFunction.neq(filter.column, filter.value)
    } else if (filter?.function === 'in') {
      queryFunction = baseQueryFunction.in(filter.column, filter.value)
    } else {
      queryFunction = baseQueryFunction
    }
    const { data, error } = await queryFunction

    checkError(error)

    if (rowIdName && rowId && Array.isArray(data) && data.length === 0) {
      throw new Error(
        `Update matched 0 rows for ${table}.${rowIdName}=${rowId}`,
      )
    }
  }
  if (operation === 'upsert') {
    // enable passing rowId and column as part of draft
    const { error } = await withAuth(
      postgrestClient.from(table).upsert({
        ...(rowIdName && rowId ? { [rowIdName]: rowId } : {}),
        ...(column ? { [column]: newValue } : {}),
        ...draft,
        updated_at: time,
        // if table = users, do not set updated_by (does not exist)
        ...(table !== 'users' ? { updated_by: username } : {}),
      }),
    )

    checkError(error)
  }
  if (operation === 'upsertMany') {
    const rows = Array.isArray(draft) ? draft : []
    if (rows.length === 0) return

    const { error } = await withAuth(
      postgrestClient.from(table).upsert(
        rows.map((d) => ({
          ...d,
          created_at: time,
          updated_at: time,
          ...(table !== 'users' ? { updated_by: username } : {}),
        })),
      ),
    )

    checkError(error)
  }
  if (operation === 'insert') {
    // enable passing rowId as part of draft
    const { error } = await withAuth(
      postgrestClient.from(table).insert({
        ...(rowIdName && rowId ? { [rowIdName]: rowId } : {}),
        ...draft,
        created_at: time,
        updated_at: time,
        // if table = users, do not set updated_by (does not exist)
        ...(table !== 'users' ? { updated_by: username } : {}),
      }),
    )

    checkError(error)
  }
  if (operation === 'insertMany') {
    const { error } = await withAuth(
      postgrestClient.from(table).insert(
        draft.map((d) => ({
          ...d,
          created_at: time,
          updated_at: time,
          // if table = users, do not set updated_by (does not exist)
          ...(table !== 'users' ? { updated_by: username } : {}),
        })),
      ),
    )

    checkError(error)
  }
  if (operation === 'delete') {
    // build base query
    const baseQueryFunction = withAuth(postgrestClient.from(table).delete())
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

    checkError(error)
  }
  if (operation === 'deleteAll') {
    const { error } = await withAuth(postgrestClient.from(table).delete())

    checkError(error)
  }

  return
}
