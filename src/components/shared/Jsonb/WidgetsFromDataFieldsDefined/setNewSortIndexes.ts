export const setNewSortIndexes = async ({ newSorting, db }) => {
  for (const [index, fieldId] of newSorting.entries()) {
    db.query(`UPDATE fields SET sort_index = $1 WHERE field_id = $2`, [
      index,
      fieldId,
    ])
  }
}
