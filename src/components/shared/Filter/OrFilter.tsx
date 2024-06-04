import React, { useCallback, memo } from 'react'
import type { InputProps } from '@fluentui/react-components'
import { Outlet } from 'react-router-dom'

import { useElectric } from '../../../ElectricProvider.tsx'
import { getValueFromChange } from '../../../modules/getValueFromChange.ts'

import '../../../form.css'

type Props = {
  filterName: string
  // filter is an object with keys and values
  filter: Record<string, unknown>
  orIndex: number
  appStateId: string
}

// TODO: generalize and move this to a shared component,
// padding in the child
export const OrFilter = memo(
  ({ filterName, orFilters, orIndex, appStateId }: Props) => {
    const { db } = useElectric()!

    const onChange: InputProps['onChange'] = useCallback(
      (e, data) => {
        const { name, value } = getValueFromChange(e, data)
        const existingOrFilter = orFilters[orIndex]
        // TODO: in text fields, lowercase?
        const newOrFilter = { ...existingOrFilter }
        if (value) {
          newOrFilter[name] = value
        } else {
          delete newOrFilter[name]
        }
        const newOrFilterIsEmpty = Object.keys(newOrFilter).length === 0

        const newFilter = !newOrFilterIsEmpty
          ? // replace the existing or filter
            orFilters.map((f, i) => (i === orIndex ? newOrFilter : f))
          : // remove the existing or filter
            orFilters.filter((f, i) => i !== orIndex)

        db.app_states.update({
          where: { app_state_id: appStateId },
          data: {
            [filterName]: newFilter.filter((f) => Object.keys(f).length > 0),
          },
        })
      },
      [appStateId, db.app_states, filterName, orFilters, orIndex],
    )

    const row = orFilters?.[orIndex]

    return (
      <div className="form-container filter">
        <Outlet context={{ onChange, row }} />
      </div>
    )
  },
)
