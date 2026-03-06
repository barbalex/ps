import { ReactNode } from 'react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { setNewFilterFromOld } from '../../../modules/setNewFilterFromOld.ts'
import * as stores from '../../../store.ts'
import { projectsFilterAtom } from '../../../store.ts'

import '../../../form.css'

type Props = {
  filterName: string
  // filter is an object with keys and values
  orFilters: Record<string, unknown>[]
  orIndex: number
  children: ReactNode
}

export const OrFilter = ({
  filterName,
  orFilters,
  orIndex,
  children,
}: Props) => {
  const filterAtom = stores[filterName] ?? projectsFilterAtom
  const setFilter = useSetAtom(filterAtom)

  // when emptying an or filter, row is undefined - catch this
  const row = orFilters?.[orIndex] ?? {}

  const onChange = (e, data) => {
    const { name, value, targetType } = getValueFromChange(e, data)
    const newFilter = setNewFilterFromOld({
      name,
      value,
      orFilters,
      orIndex,
      targetType,
    })
    try {
      setFilter(newFilter)
    } catch (error) {
      console.log('OrFilter, error updating app state:', error)
    }
  }

  return (
    <div className="form-container filter">
      {children({ row, onChange, orIndex })}
    </div>
  )
}
