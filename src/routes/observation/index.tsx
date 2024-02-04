import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { Observations as Observation } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { Jsonb } from '../../components/shared/Jsonb'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { DateField } from '../../components/shared/DateField'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { observation_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.observations.liveUnique({ where: { observation_id } }),
  )

  const row: Observation = results

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.observations.update({
        where: { observation_id },
        data: { [name]: value },
      })
    },
    [db.observations, observation_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  // TODO: inactivate these fields
  // observations are only imported, not created
  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="observation_id"
          value={row.observation_id}
        />
        <TextField
          label="Place"
          name="place_id"
          value={row.place_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextFieldInactive
          label="ID in source"
          name="id_in_source"
          value={row.id_in_source ?? ''}
        />
        <TextFieldInactive
          label="Url"
          name="url"
          type="url"
          value={row.url ?? ''}
        />
        <DateField
          label="Date"
          name="date"
          value={row.date ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Author"
          name="author"
          value={row.author ?? ''}
          onChange={onChange}
        />
        <Jsonb
          table="observations"
          idField="observation_id"
          id={row.observation_id}
          data={row.data ?? {}}
        />
      </div>
    </div>
  )
}
