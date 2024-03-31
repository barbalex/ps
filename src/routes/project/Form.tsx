import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { Jsonb } from '../../components/shared/Jsonb'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Loading } from '../../components/shared/Loading'

export const Form = memo(({ autoFocusRef }) => {
  const { project_id } = useParams()

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

  if (!row) return <Loading />

  return (
    <div className="form-container" role="tabpanel" aria-labelledby="form">
      <TextFieldInactive label="ID" name="project_id" value={row.project_id} />
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
    </div>
  )
})
