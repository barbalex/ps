import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { Subprojects as Subproject } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { Jsonb } from '../../components/shared/Jsonb'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'

import '../../form.css'

export const Component = () => {
  const { subproject_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.subprojects.liveUnique({ where: { subproject_id } }),
  )

  const row: Subproject = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.subprojects.update({
        where: { subproject_id },
        data: { [name]: value },
      })
    },
    [db.subprojects, subproject_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  // console.log('subproject, row.data:', row?.data)

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />å
      <div className="form-container">
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
          label="Since year"
          name="since_year"
          value={row.since_year ?? ''}
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
    </div>
  )
}
