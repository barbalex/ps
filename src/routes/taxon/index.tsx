import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { taxon_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.taxa.liveUnique({ where: { taxon_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.taxa.update({
        where: { taxon_id },
        data: { [name]: value },
      })
    },
    [db.taxa, taxon_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive label="ID" name="taxon_id" value={row.taxon_id} />
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="ID in source"
          name="id_in_source"
          value={row.id_in_source ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Url"
          name="url"
          type="url"
          value={row.url ?? ''}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
