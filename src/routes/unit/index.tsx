import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { Units as Unit } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { SwitchField } from '../../components/shared/SwitchField'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { unit_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(db.units.liveUnique({ where: { unit_id } }))

  const row: Unit = results

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.units.update({
        where: { unit_id },
        data: { [name]: value },
      })
    },
    [db.units, unit_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive label="ID" name="unit_id" value={row.unit_id} />
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <SwitchField
          label="Use for action values"
          name="use_for_action_values"
          value={row.use_for_action_values ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Use for action report values"
          name="use_for_action_report_values"
          value={row.use_for_action_report_values ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Use for check values"
          name="use_for_check_values"
          value={row.use_for_check_values ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Use for place report values"
          name="use_for_place_report_values"
          value={row.use_for_place_report_values ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Use for goal report values"
          name="use_for_goal_report_values"
          value={row.use_for_goal_report_values ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Use for subproject taxa"
          name="use_for_subproject_taxa"
          value={row.use_for_subproject_taxa ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Use for check taxa"
          name="use_for_check_taxa"
          value={row.use_for_check_taxa ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Summable"
          name="summable"
          value={row.summable ?? false}
          onChange={onChange}
        />
        <TextField
          label="Sort value"
          name="sort"
          type="number"
          value={row.sort ?? ''}
          onChange={onChange}
        />
        <TextField
          label="List"
          name="list_id"
          value={row.list_id ?? ''}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
