import * as stores from '../store.ts'

export const setNewFilterFromOld = ({
  name,
  value,
  orFilters,
  orIndex,
  filterName,
  targetType,
}) => {
  const useValueUnchanged =
    ['text', 'email', 'boolean', 'date'].includes(targetType) ||
    typeof value === 'boolean'
  const existingOrFilter = orFilters[orIndex] ?? {}
  const isAppending = orIndex >= orFilters.length
  const newOrFilter = { ...existingOrFilter }

  if (value !== undefined && value !== null && value !== '') {
    newOrFilter[name] = useValueUnchanged
      ? value // numbers get passed as string when coming from options
      : // need to convert them back to numbers
        !isNaN(value)
        ? parseFloat(value)
        : value
  } else {
    delete newOrFilter[name]
  }
  // console.log('setNewFilterFromOld 2', { newOrFilter })
  const newOrFilterIsEmpty = Object.keys(newOrFilter).length === 0
  // console.log('setNewFilterFromOld 3', { newOrFilterIsEmpty })
  const createNewOrFilters = orFilters.length === 0 && !newOrFilterIsEmpty
  // console.log('setNewFilterFromOld 4', { createNewOrFilters })

  const newFilterWithEmptys = createNewOrFilters
    ? [newOrFilter]
    : !newOrFilterIsEmpty
      ? isAppending
        ? [...orFilters, newOrFilter]
        : // replace the existing or filter
          orFilters.map((f, i) => (i === orIndex ? newOrFilter : f))
      : // remove the existing or filter
        orFilters.filter((f, i) => i !== orIndex)
  // console.log('setNewFilterFromOld 5', { newFilterWithEmptys })
  const newFilterWithoutEmptys = newFilterWithEmptys.filter(
    (f) => Object.keys(f).length > 0,
  )
  // console.log('setNewFilterFromOld 6', { newFilterWithoutEmptys })
  const filterAtom = stores[filterName]
  try {
    stores.store.set(filterAtom, newFilterWithoutEmptys)
  } catch (error) {
    console.log('OrFilter, error updating app state:', error)
  }
}
