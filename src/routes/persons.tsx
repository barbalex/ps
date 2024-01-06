import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Persons as Person } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { person as createNewPerson } from '../modules/createRows'
import { ListViewMenu } from '../components/ListViewMenu'
import '../form.css'

export const Component = () => {
  const navigate = useNavigate()
  const { project_id } = useParams()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.persons.liveMany({ where: { project_id, deleted: false } }),
    [project_id],
  )

  const add = useCallback(async () => {
    const data = await createNewPerson({ db, project_id })
    await db.persons.create({ data })
    navigate(`/projects/${project_id}/persons/${data.person_id}`)
  }, [db, navigate, project_id])

  const persons: Person[] = results ?? []

  return (
    <div className="form-container">
      <ListViewMenu addRow={add} tableName="person" />
      {persons.map((person: Person, index: number) => (
        <p key={index} className="item">
          <Link to={`/projects/${project_id}/persons/${person.person_id}`}>
            {person.label ?? person.person_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
