import * as stores from '../store.ts'

export const setNewFilterFromOld = ({
  name,
  value,
  orFilters,
  orIndex,
  filterName,
  targetType,
}) => {
  console.log('setNewFilterFromOld 0', {
    name,
    value,
    orFilters,
    orIndex,
    filterName,
    targetType,
  })
  const valueIsText = ['text', 'email'].includes(targetType)
  const existingOrFilter = orFilters[orIndex]
  const newOrFilter = { ...existingOrFilter }
  console.log('setNewFilterFromOld 1', {
    existingOrFilter,
    newOrFilter,
  })
  if (value !== undefined && value !== null && value !== '') {
    const isDate = value instanceof Date
    newOrFilter[name] = valueIsText
      ? value
      : typeof value == 'boolean'
      ? value // numbers get passed as string when coming from options
      : // need to convert them back to numbers
      !isNaN(value)
      ? parseFloat(value)
      : // dates need to be converted to iso strings
      isDate
      ? value.toISOString()
      : value
  } else {
    delete newOrFilter[name]
  }
  console.log('setNewFilterFromOld 2', { newOrFilter })
  const newOrFilterIsEmpty = Object.keys(newOrFilter).length === 0
  console.log('setNewFilterFromOld 3', { newOrFilterIsEmpty })
  const createNewOrFilters = orFilters.length === 0 && !newOrFilterIsEmpty
  console.log('setNewFilterFromOld 4', { createNewOrFilters })

  const newFilterWithEmptys = createNewOrFilters
    ? [newOrFilter]
    : !newOrFilterIsEmpty
    ? // replace the existing or filter
      orFilters.map((f, i) => (i === orIndex ? newOrFilter : f))
    : // remove the existing or filter
      orFilters.filter((f, i) => i !== orIndex)
  console.log('setNewFilterFromOld 5', { newFilterWithEmptys })
  const newFilterWithoutEmptys = newFilterWithEmptys.filter(
    (f) => Object.keys(f).length > 0,
  )
  console.log('setNewFilterFromOld 6', { newFilterWithoutEmptys })
  const filterAtom = stores[filterName]
  try {
    // TODO: re-activate
    stores.store.set(filterAtom, newFilterWithoutEmptys)
  } catch (error) {
    console.log('OrFilter, error updating app state:', error)
  }
}
