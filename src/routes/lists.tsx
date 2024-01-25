import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Lists as List } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createList } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.lists.liveMany({
      where: { project_id, deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = await createList({ db, project_id })
    await db.lists.create({ data })
    navigate(`/projects/${project_id}/lists/${data.list_id}`)
  }, [db, navigate, project_id])

  const lists: List[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader title="Lists" addRow={add} tableName="list" />
      <div className="list-container">
        {lists.map(({ list_id, label }) => (
          <Row
            key={list_id}
            to={`/projects/${project_id}/lists/${list_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
