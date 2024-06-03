import { useCallback, memo } from 'react'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../../ElectricProvider.tsx'
import { getValueFromChange } from '../../../modules/getValueFromChange.ts'
import { WidgetForFieldForm } from '../Form.tsx'

import '../../../form.css'

type Props = {
  filterName: string
  // filter is an object with keys and values
  filter: Record<string, unknown>
  orIndex: number
  appStateId: string
}

// TODO: generalize and move this to a shared component
export const Filter = memo(
  ({ filterName, filter, orIndex, appStateId }: Props) => {
    const { db } = useElectric()!

    console.log('hello widgetForField Filter', {
      filter,
      orIndex,
      filterName,
      appStateId,
    })

    const onChange: InputProps['onChange'] = useCallback(
      (e, data) => {
        const { name, value } = getValueFromChange(e, data)
        const existingOrFilter = filter.or[orIndex]
        // TODO: in text fields, lowercase?
        const newOrFilter = { ...existingOrFilter }
        if (value) {
          newOrFilter[name] = value
        } else {
          delete newOrFilter[name]
        }
        const newFilter =
          Object.keys(newOrFilter).length > 0
            ? // replace the existing or filter
              filter.or.map((f, i) => (i === orIndex ? newOrFilter : f))
            : // remove the existing or filter
              filter.or.filter((f, i) => i !== orIndex)
        console.log('hello widgetForField Filter, onChange', {
          filter,
          orIndex,
          newFilter,
          existingOrFilter,
          newOrFilter,
        })
        db.app_states.update({
          where: { app_state_id: appStateId },
          data: { [filterName]: { or: newFilter } },
        })
      },
      [appStateId, db.app_states, filter, filterName, orIndex],
    )

    return (
      <div className="form-container filter">
        <WidgetForFieldForm onChange={onChange} row={filter.or[orIndex]} />
      </div>
    )
  },
)
