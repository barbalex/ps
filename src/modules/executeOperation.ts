import { store, postgrestClientAtom } from '../store.ts'
const postgrestClient = store.get(postgrestClientAtom)

export const executeOperation = async (o) => {
  if (!o) return

  const {
    id,
    time,
    // name,
    table,
    rowIdName,
    rowId,
    operation,
    // variables,
    column,
    newValue,
  } = o

  if (operation === 'update') {
    const { error } = await postgrestClient
      .from(table)
      .update({ [column]: newValue })
      .eq(rowIdName, rowId)

    if (error) throw error
  }
  if (operation === 'insert') {
    const { error } = await postgrestClient
      .from(table)
      .insert({ [rowIdName]: rowId })
  }
  if (operation === 'delete') {
    const { error } = await postgrestClient
      .from(table)
      .delete()
      .eq(rowIdName, rowId)
  }
}
