import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { TextArea } from '../../components/shared/TextArea'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { occurrence_import_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.occurrence_imports.liveUnique({ where: { occurrence_import_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.occurrence_imports.update({
        where: { occurrence_import_id },
        data: { [name]: value },
      })
    },
    [db.occurrence_imports, occurrence_import_id],
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
          name="occurrence_import_id"
          value={row.occurrence_import_id}
        />
        <TextFieldInactive
          label="Created time"
          name="created_time"
          value={row.created_time}
        />
        <TextFieldInactive
          label="Inserted time"
          name="inserted_time"
          value={row.inserted_time}
        />
        <TextFieldInactive
          label="Inserted count"
          name="inserted_count"
          value={row.inserted_count}
          type="number"
        />
        <TextField
          label="Name"
          name="name"
          type="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextArea
          label="Attribution"
          name="attribution"
          value={row.attribution ?? ''}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
