import React, { useCallback, memo, useMemo } from 'react'
import type { InputProps } from '@fluentui/react-components'
import { Outlet } from 'react-router-dom'

import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { setNewFilterFromOld } from '../../../modules/setNewFilterFromOld.ts'
import { parseRowsDates } from '../../../modules/parseRowsDates.ts'

import '../../../form.css'

type Props = {
  filterName: string
  // filter is an object with keys and values
  orFilters: Record<string, unknown>[]
  orIndex: number
}

export const OrFilter = memo(({ filterName, orFilters, orIndex }: Props) => {
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

  // when emptying an or filter, row is undefined - catch this
  const row = useMemo(() => {
    const row = orFilters?.[orIndex] ?? {}
    return parseRowsDates(row)
  }, [orFilters, orIndex])

  return (
    <div className="form-container filter">
      <Outlet context={{ onChange, row, orIndex }} />
    </div>
  )
})
