import { useLiveQuery } from 'electric-sql/react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { Goals as Goal } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { goal as createGoalPreset } from '../modules/dataPresets'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.goals.liveMany({ where: { subproject_id, deleted: false } }),
    [subproject_id],
  )

  const add = async () => {
    const newGoal = createGoalPreset()
    await db.goals.create({
      data: {
        ...newGoal,
        subproject_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${newGoal.goal_id}`,
    )
  }

  const goals: Goal[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
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
