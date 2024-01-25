import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Goals as Goal } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createGoal } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.goals.liveMany({
      where: { subproject_id, deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const add = useCallback(async () => {
    const data = await createGoal({ db, project_id, subproject_id })
    await db.goals.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${data.goal_id}`,
    )
  }, [db, navigate, project_id, subproject_id])

  const goals: Goal[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader title="Goals" addRow={add} tableName="goal" />
      <div className="list-container">
        {goals.map(({ goal_id, label }) => (
          <Row
            key={goal_id}
            label={label}
            to={`/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}`}
          />
        ))}
      </div>
    </div>
  )
}
