import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { Actions as Action } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { DateField } from '../../components/shared/DateField'
import { SwitchField } from '../../components/shared/SwitchField'
import { Jsonb } from '../../components/shared/Jsonb'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { EditingGeometry } from '../../components/shared/EditingGeometry'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { action_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.actions.liveUnique({ where: { action_id } }),
  )

  const row: Action = results

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.actions.update({
        where: { action_id },
        data: { [name]: value },
      })
    },
    [db.actions, action_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive label="ID" name="action_id" value={row.action_id} />
        <DateField
          label="Date"
          name="date"
          value={row.date}
          onChange={onChange}
        />
        <SwitchField
          label="relevant for reports"
          name="relevant_for_reports"
          value={row.relevant_for_reports}
          onChange={onChange}
        />
        <Jsonb
          table="actions"
          idField="action_id"
          id={row.action_id}
          data={row.data ?? {}}
          autoFocus
          ref={autoFocusRef}
        />
        <EditingGeometry row={row} table="actions" />
      </div>
    </div>
  )
}
