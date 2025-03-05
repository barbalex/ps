import React, { useCallback, memo, useMemo } from 'react'
import type { InputProps } from '@fluentui/react-components'
import { Outlet } from 'react-router-dom'

import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import * as stores from '../../../store.ts'

import '../../../form.css'

type Props = {
  filterName: string
  // filter is an object with keys and values
  orFilters: Record<string, unknown>[]
  orIndex: number
}

export const OrFilter = memo(({ filterName, orFilters, orIndex }) => {
  // TODO: add more filters here
  // console.log('OrFilter 1', { filterObject, orFilters, orIndex })

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      const targetType = e.target.type
      const isText = ['text', 'email'].includes(targetType)
      console.log('OrFilter, onChange 1', { targetType, name, value, isText })
      // stores.store.set(filterAtom, [])

      // TODO: how to filter on jsonb fields?
      // example from electric-sql discord: https://discord.com/channels/933657521581858818/1246045111478124645
      // where: { [jsonbFieldName]: { path: ["is_admin"], equals: true } },

      const existingOrFilter = orFilters[orIndex]
      const newOrFilter = { ...existingOrFilter }
      if (value !== undefined && value !== null && value !== '') {
        const isDate = value instanceof Date
        newOrFilter[name] = isText
          ? { contains: value }
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
      const newOrFilterIsEmpty = Object.keys(newOrFilter).length === 0

      const newFilterWithEmptys = !newOrFilterIsEmpty
        ? // replace the existing or filter
          orFilters.map((f, i) => (i === orIndex ? newOrFilter : f))
        : // remove the existing or filter
          orFilters.filter((f, i) => i !== orIndex)
      const newFilterWithoutEmptys = newFilterWithEmptys.filter(
        (f) => Object.keys(f).length > 0,
      )
      const filterAtom = stores[filterName]
      console.log('OrFiler.onChage, will set filterAtom:', {
        filterName,
        newFilterWithoutEmptys,
      })
      try {
        // TODO: re-activate
        // stores.store.set(filterAtom, newFilterWithoutEmptys)
      } catch (error) {
        console.log('OrFilter, error updating app state:', error)
      }
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
      <Outlet context={{ onChange, row: rowValues }} />
    </div>
  )
})
