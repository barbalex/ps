import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Persons as Person } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createPerson } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
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
    const data = await createPerson({ db, project_id })
    await db.persons.create({ data })
    navigate(`/projects/${project_id}/persons/${data.person_id}`)
  }, [db, navigate, project_id])

  const persons: Person[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader title="Persons" addRow={add} tableName="person" />
      <div className="list-container">
        {persons.map(({ person_id, label }) => (
          <Row
            key={person_id}
            to={`/projects/${project_id}/persons/${person_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
