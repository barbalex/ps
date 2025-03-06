import React, { useCallback, memo, useMemo } from 'react'
import type { InputProps } from '@fluentui/react-components'
import { Outlet } from 'react-router-dom'

import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import * as stores from '../../../store.ts'
import { setNewFilterFromOldAndChange } from '../../../modules/setNewFilterFromOldAndChange.ts'

import '../../../form.css'

type Props = {
  filterName: string
  // filter is an object with keys and values
  orFilters: Record<string, unknown>[]
  orIndex: number
}

export const OrFilter = memo(({ filterName, orFilters, orIndex }: Props) => {
  // TODO: add more filters here
  // console.log('OrFilter 1', { filterObject, orFilters, orIndex })

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value, targetType } = getValueFromChange(e, data)
      console.log('OrFilter.onChange', {
        filterName,
        targetType,
        name,
        value,
        orFilters,
        orIndex,
      })
      setNewFilterFromOldAndChange({
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
  const row = useMemo(() => orFilters?.[orIndex] ?? {}, [orFilters, orIndex])

  // some values are { contains: 'value' } - need to extract the value
  const rowValues = Object.entries(row ?? {}).reduce((acc, [k, v]) => {
    let value = typeof v === 'object' ? v.contains : v
    // parse iso date if is or form will error
    // need to exclude numbers
    if (isNaN(value)) {
      let parsedDate
      try {
        parsedDate = Date.parse(value)
      } catch (error) {
        console.log('OrFilter, error parsing date:', error)
      }
      if (!isNaN(parsedDate)) {
        try {
          value = new Date(parsedDate)
        } catch (error) {
          console.log('OrFilter, error creating date:', error)
        }
      }
    }

    return { ...acc, [k]: value }
  }, {})

  // console.log('OrFilter 2', { rowValues, row })

  return (
    <div className="form-container filter">
      <Outlet context={{ onChange, row: rowValues, orIndex }} />
    </div>
  )
})
