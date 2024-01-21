import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Persons as Person } from '../../../generated/client'
import { createPerson } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { project_id, person_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.persons.liveUnique({ where: { person_id } }),
    [person_id],
  )

  const baseUrl = `/projects/${project_id}/persons`

  const addRow = useCallback(async () => {
    const data = await createPerson({ db, project_id })
    await db.persons.create({ data })
    navigate(`${baseUrl}/${data.person_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.persons.delete({
      where: { person_id },
    })
    navigate(baseUrl)
  }, [baseUrl, db.persons, navigate, person_id])

  const toNext = useCallback(async () => {
    const persons = await db.persons.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = persons.length
    const index = persons.findIndex((p) => p.person_id === person_id)
    const next = persons[(index + 1) % len]
    navigate(`${baseUrl}/${next.person_id}`)
  }, [baseUrl, db.persons, navigate, person_id, project_id])

  const toPrevious = useCallback(async () => {
    const persons = await db.persons.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = persons.length
    const index = persons.findIndex((p) => p.person_id === person_id)
    const previous = persons[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.person_id}`)
  }, [baseUrl, db.persons, navigate, person_id, project_id])

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
    <div className="form-outer-container">
      <FormHeader
        title="Person"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="person"
      />
      <div className="form-container">
        <TextFieldInactive label="ID" name="person_id" value={row.person_id} />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={row.email ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <Jsonb
          table="persons"
          idField="person_id"
          id={row.person_id}
          data={row.data ?? {}}
        />
      </div>
    </div>
  )
}
