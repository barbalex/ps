import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Loading } from '../../components/shared/Loading.tsx'

export const SubprojectForm = memo(({ autoFocusRef }) => {
  const { subproject_id } = useParams()

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.subprojects.liveUnique({ where: { subproject_id } }),
  )

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.subprojects.update({
        where: { subproject_id },
        data: { [name]: value },
      })
    },
    [db.subprojects, subproject_id],
  )

  if (!row) return <Loading />

  // console.log('subproject, row.data:', row?.data)

  return (
    <div className="form-container" role="tabpanel" aria-labelledby="form">
      <TextFieldInactive
        label="ID"
        name="subproject_id"
        value={row.subproject_id ?? ''}
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
        label="Start year"
        name="start_year"
        value={row.start_year ?? ''}
        type="number"
        onChange={onChange}
      />
      <Jsonb
        table="subprojects"
        idField="subproject_id"
        id={row.subproject_id}
        data={row.data ?? {}}
      />
    </div>
  )
})
