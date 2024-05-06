import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

export const Component = () => {
  const { widget_for_field_id } = useParams<{ widget_for_field_id: string }>()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.widgets_for_fields.liveUnique({ where: { widget_for_field_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.widgets_for_fields.update({
        where: { widget_for_field_id },
        data: { [name]: value },
      })
    },
    [db.widgets_for_fields, widget_for_field_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="widget_for_field_id"
          value={row.widget_for_field_id}
        />
        <DropdownField
          label="Field type"
          name="field_type_id"
          table="field_types"
          value={row.field_type_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <DropdownField
          label="Widget type"
          name="widget_type_id"
          table="widget_types"
          value={row.widget_type_id ?? ''}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
