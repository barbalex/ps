import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { Lists as List } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { SwitchField } from '../../components/shared/SwitchField'
import { Jsonb } from '../../components/shared/Jsonb'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { FormHeaderComponent } from './FormHeader'

import '../../form.css'

export const Component = () => {
  const { list_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(db.lists.liveUnique({ where: { list_id } }))

  const row: List = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.lists.update({
        where: { list_id },
        data: { [name]: value },
      })
    },
    [db.lists, list_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <FormHeaderComponent autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive label="ID" name="list_id" value={row.list_id} />
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <Jsonb
          table="lists"
          idField="list_id"
          id={row.list_id}
          data={row.data ?? {}}
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
