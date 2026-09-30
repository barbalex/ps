import { ReactNode } from 'react'

import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { setNewFilterFromOld } from '../../../modules/setNewFilterFromOld.ts'

import '../../../form.css'
import type { FieldChangeData } from '../fieldChange.ts'

export type OrFilterRenderProps = {
  // row is an object with keys and values; typed as never so filter forms can
  // read any key while real values live in the filter state
  row: Record<string, never>
  onChange: (...args: Parameters<typeof getValueFromChange>) => void
  orIndex: number
}

type Props = {
  filterName?: string
  orFilters: Record<string, unknown>[]
  orIndex: number
  onFilterChange: (newFilter: Record<string, unknown>[]) => void
  children: (renderProps: OrFilterRenderProps) => ReactNode
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

  const onChange = (
    e: Parameters<typeof getValueFromChange>[0],
    data?: FieldChangeData,
  ) => {
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
      {children({ row: row as Record<string, never>, onChange, orIndex })}
    </div>
  )
}
