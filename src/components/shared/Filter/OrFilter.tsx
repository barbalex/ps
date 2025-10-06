import { useCallback, memo, ReactNode } from 'react'
import type { InputProps } from '@fluentui/react-components'

import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { setNewFilterFromOld } from '../../../modules/setNewFilterFromOld.ts'

import '../../../form.css'

type Props = {
  filterName: string
  // filter is an object with keys and values
  orFilters: Record<string, unknown>[]
  orIndex: number
  children: ReactNode
}

export const OrFilter = memo(
  ({ filterName, orFilters, orIndex, children }: Props) => {
    // when emptying an or filter, row is undefined - catch this
    const row = orFilters?.[orIndex] ?? {}

    const onChange = useCallback<InputProps['onChange']>(
      (e, data) => {
        const { name, value, targetType } = getValueFromChange(e, data)
        setNewFilterFromOld({
          name,
          value,
          orFilters,
          orIndex,
          filterName,
          targetType,
        })
      },
      [filterName, orFilters, orIndex],
    )

    return (
      <div className="form-container filter">
        {children({ row, onChange, orIndex })}
      </div>
    )
  },
)
