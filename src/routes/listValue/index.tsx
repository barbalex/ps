import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { ListValues as ListValue } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { SwitchField } from '../../components/shared/SwitchField'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { list_value_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.list_values.liveUnique({ where: { list_value_id } }),
  )

  const row: ListValue = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.list_values.update({
        where: { list_value_id },
        data: { [name]: value },
      })
    },
    [db.list_values, list_value_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="list_value_id"
          value={row.list_value_id}
        />
        <TextField
          label="Value"
          name="value"
          value={row.value ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <SwitchField
          label="Obsolete"
          name="obsolete"
          value={row.obsolete}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
