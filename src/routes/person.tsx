import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Persons as Person } from '../../../generated/client'
import { createPerson } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, person_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.persons.liveUnique({ where: { person_id } }),
    [person_id],
  )

  const addRow = useCallback(async () => {
    const data = await createPerson({ db, project_id })
    await db.persons.create({ data })
    navigate(`/projects/${project_id}/persons/${data.person_id}`)
  }, [db, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.persons.delete({
      where: {
        person_id,
      },
    })
    navigate(`/projects/${project_id}/persons`)
  }, [db.persons, navigate, person_id, project_id])

  const row: Person = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.persons.update({
        where: { person_id },
        data: { [name]: value },
      })
    },
    [db.persons, person_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu addRow={addRow} deleteRow={deleteRow} tableName="person" />
      <TextFieldInactive label="ID" name="person_id" value={row.person_id} />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={row.email ?? ''}
        onChange={onChange}
        autoFocus
      />
      <Jsonb
        table="persons"
        idField="person_id"
        id={row.person_id}
        data={row.data ?? {}}
      />
    </div>
  )
}
