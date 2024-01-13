import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Goals as Goal } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createGoal } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import '../form.css'

export const Component = () => {
  const { project_id, subproject_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.goals.liveMany({ where: { subproject_id, deleted: false } }),
    [subproject_id],
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
      {goals.map((goal: Goal, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/goals/${goal.goal_id}`}
          >
            {goal.label ?? goal.goal_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
