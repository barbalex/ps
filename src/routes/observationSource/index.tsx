import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { ObservationSources as ObservationSource } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { Jsonb } from '../../components/shared/Jsonb'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { observation_source_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.observation_sources.liveUnique({ where: { observation_source_id } }),
  )

  const row: ObservationSource = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.observation_sources.update({
        where: { observation_source_id },
        data: { [name]: value },
      })
    },
    [db.observation_sources, observation_source_id],
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
          name="observation_source_id"
          value={row.observation_source_id}
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
          label="Url"
          name="url"
          type="url"
          value={row.url ?? ''}
          onChange={onChange}
        />
        <Jsonb
          table="observation_sources"
          idField="observation_source_id"
          id={row.observation_source_id}
          data={row.data ?? {}}
        />
      </div>
    </div>
  )
}
