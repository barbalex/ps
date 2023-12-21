import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { Button } from '@fluentui/react-components'

import { Persons as Person } from '../../../generated/client'
import { person as createPersonPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'

import '../form.css'

export const Component = () => {
  const { project_id, person_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.persons.liveUnique({ where: { person_id } }),
    [person_id],
  )

  const addRow = async () => {
    const newPerson = createPersonPreset()
    await db.persons.create({
      data: { ...newPerson, project_id },
    })
    navigate(`/projects/${project_id}/persons/${newPerson.person_id}`)
  }

  const deleteRow = async () => {
    await db.persons.delete({
      where: {
        person_id,
      },
    })
    navigate(`/projects/${project_id}/persons`)
  }

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
      <div className="controls">
        <Button
          size="large"
          icon={<FaPlus />}
          onClick={addRow}
          title="Add new person"
        />
        <Button
          size="large"
          icon={<FaMinus />}
          onClick={deleteRow}
          title="Delete person"
        />
      </div>
      <TextFieldInactive label="ID" name="person_id" value={row.person_id} />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={row.email ?? ''}
        onChange={onChange}
      />
    </div>
  )
}
