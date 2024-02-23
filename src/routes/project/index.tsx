import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { Label, Divider } from '@fluentui/react-components'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { RadioGroupField } from '../../components/shared/RadioGroupField'
import { CheckboxField } from '../../components/shared/CheckboxField'
import { Jsonb } from '../../components/shared/Jsonb'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { LabelBy } from '../../components/shared/LabelBy'
import { FieldList } from '../../components/shared/FieldList'
import { Header } from './Header'
import { SwitchField } from '../../components/shared/SwitchField'
import { Design } from './Design'

import '../../form.css'

export const Component = () => {
  const { project_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.projects.update({
        where: { project_id },
        data: { [name]: value },
      })
    },
    [db.projects, project_id],
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
          name="project_id"
          value={row.project_id}
        />
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <Jsonb
          table="projects"
          idField="project_id"
          id={row.project_id}
          data={row.data ?? {}}
        />
        <Divider />
        <Design row={row} />
      </div>
    </div>
  )
}
