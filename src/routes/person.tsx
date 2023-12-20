import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Persons as Person } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { project_id, person_id } = useParams()
  const { results } = useLiveQuery(
    db.persons.liveUnique({ where: { person_id } }),
  )

  const addItem = async () => {
    await db.persons.create({
      data: {
        person_id: uuidv7(),
        project_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.persons.deleteMany()
  }

  const person: Person = results

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      <div>{`Person with id ${person?.person_id ?? ''}`}</div>
    </div>
  )
}
