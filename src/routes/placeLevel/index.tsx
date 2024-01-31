import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { PlaceLevels as PlaceLevel } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { SwitchField } from '../../components/shared/SwitchField'
import { RadioGroupField } from '../../components/shared/RadioGroupField'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { FormHeaderComponent } from './FormHeader'

import '../../form.css'

export const Component = () => {
  const { place_level_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.place_levels.liveUnique({ where: { place_level_id } }),
  )

  const row: PlaceLevel = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      const valueToUse = name === 'level' ? +value : value
      db.place_levels.update({
        where: { place_level_id },
        data: { [name]: valueToUse },
      })
    },
    [db.place_levels, place_level_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  // console.log('place level', row)

  return (
    <div className="form-outer-container">
      <FormHeaderComponent autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="place_level_id"
          value={row.place_level_id}
        />
        <RadioGroupField
          label="Level"
          name="level"
          list={[1, 2]}
          value={row.level ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Name (singular)"
          name="name_singular"
          value={row.name_singular ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="Name (plural)"
          name="name_plural"
          value={row.name_plural ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Name (short)"
          name="name_short"
          value={row.name_short ?? ''}
          onChange={onChange}
        />
        <SwitchField
          label="Enable reports"
          name="reports"
          value={row.reports ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable report values"
          name="report_values"
          value={row.report_values ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable actions"
          name="actions"
          value={row.actions ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable action values"
          name="action_values"
          value={row.action_values ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable action reports"
          name="action_reports"
          value={row.action_reports ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable checks"
          name="checks"
          value={row.checks ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable check values"
          name="check_values"
          value={row.check_values ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable check taxa"
          name="check_taxa"
          value={row.check_taxa ?? false}
          onChange={onChange}
        />
        <SwitchField
          label="Enable observation references"
          name="observation_references"
          value={row.observation_references ?? false}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
