import * as stores from '../store.ts'

export const setNewFilterFromOldAndChange = ({
  name,
  value,
  orFilters,
  orIndex,
  filterName,
  targetType,
}) => {
  const valueIsText = ['text', 'email'].includes(targetType)
  const existingOrFilter = orFilters[orIndex]
  const newOrFilter = { ...existingOrFilter }
  console.log('newFilterFromOldAndChange 1', { existingOrFilter, newOrFilter })
  if (value !== undefined && value !== null && value !== '') {
    const isDate = value instanceof Date
    newOrFilter[name] = valueIsText
      ? value
      : // numbers get passed as string when coming from options
      // need to convert them back to numbers
      !isNaN(value)
      ? parseFloat(value)
      : // dates need to be converted to iso strings
      isDate
      ? value.toISOString()
      : value
  } else {
    delete newOrFilter[name]
  }
  console.log('newFilterFromOldAndChange 2', { newOrFilter })
  const newOrFilterIsEmpty = Object.keys(newOrFilter).length === 0
  console.log('newFilterFromOldAndChange 3', { newOrFilterIsEmpty })
  const createNewOrFilters = orFilters.length === 0 && !newOrFilterIsEmpty
  console.log('newFilterFromOldAndChange 4', { createNewOrFilters })

  const newFilterWithEmptys = createNewOrFilters
    ? [newOrFilter]
    : !newOrFilterIsEmpty
    ? // replace the existing or filter
      orFilters.map((f, i) => (i === orIndex ? newOrFilter : f))
    : // remove the existing or filter
      orFilters.filter((f, i) => i !== orIndex)
  console.log('newFilterFromOldAndChange 5', { newFilterWithEmptys })
  const newFilterWithoutEmptys = newFilterWithEmptys.filter(
    (f) => Object.keys(f).length > 0,
  )
  console.log('newFilterFromOldAndChange 6', { newFilterWithoutEmptys })
  const filterAtom = stores[filterName]
  try {
    // TODO: re-activate
    stores.store.set(filterAtom, newFilterWithoutEmptys)
  } catch (error) {
    console.log('OrFilter, error updating app state:', error)
  }
}
