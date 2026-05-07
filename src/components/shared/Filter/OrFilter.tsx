import { ReactNode } from 'react'

import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { setNewFilterFromOld } from '../../../modules/setNewFilterFromOld.ts'

import '../../../form.css'

type Props = {
  filterName?: string
  // filter is an object with keys and values
  orFilters: Record<string, unknown>[]
  orIndex: number
  onFilterChange: (newFilter: Record<string, unknown>[]) => void
  children: ReactNode
}

export const OrFilter = ({
  orFilters,
  orIndex,
  onFilterChange,
  children,
}: Props) => {
  // when emptying an or filter, row is undefined - catch this
  const rawRow = orFilters?.[orIndex] ?? {}
  // unwrap { $eq: value } objects so form components display the plain value
  const row = Object.fromEntries(
    Object.entries(rawRow).map(([k, v]) =>
      v !== null && typeof v === 'object' && '$eq' in v
        ? [k, (v as { $eq: unknown }).$eq]
        : [k, v],
    ),
  )

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
      onFilterChange(newFilter)
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
