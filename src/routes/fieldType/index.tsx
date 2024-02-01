import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { FieldTypes as FieldType } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { field_type_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.field_types.liveUnique({ where: { field_type_id } }),
  )

  const row: FieldType = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.field_types.update({
        where: { field_type_id },
        data: { [name]: value },
      })
    },
    [db.field_types, field_type_id],
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
          name="field_type_id"
          value={row.field_type_id}
        />
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="Sort value"
          name="sort"
          value={row.sort ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Comment"
          name="comment"
          value={row.comment ?? ''}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
