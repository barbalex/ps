import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { Persons as Person } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../User.css'

export const Component = () => {
  const { project_id } = useParams<{ project_id: string }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.persons.liveMany())

  const add = async () => {
    await db.persons.create({
      data: {
        person_id: uuidv7(),
        project_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.persons.deleteMany()
  }

  const persons: Person[] = results ?? []

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
        <button className="button" onClick={clear}>
          Clear
        </button>
      </div>
      {persons.map((person: Person, index: number) => (
        <p key={index} className="item">
          <Link to={`/projects/${project_id}/persons/${person.person_id}`}>
            {person.person_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
