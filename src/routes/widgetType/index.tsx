import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { SwitchField } from '../../components/shared/SwitchField'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'
import { Loading } from '../../components/shared/Loading'

import '../../form.css'

export const Component = () => {
  const { widget_type_id } = useParams<{ widget_type_id: string }>()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.widget_types.liveUnique({ where: { widget_type_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.widget_types.update({
        where: { widget_type_id },
        data: { [name]: value },
      })
    },
    [db.widget_types, widget_type_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="widget_type_id"
          value={row.widget_type_id}
        />
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <SwitchField
          label="Needs a list"
          name="needs_list"
          value={row.needs_list ?? false}
          onChange={onChange}
        />
        <TextField
          label="Sort value"
          name="sort"
          value={row.sort ?? ''}
          type="number"
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
