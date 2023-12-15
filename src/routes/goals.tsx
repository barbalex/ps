import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { Goals as Goal } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../User.css'

export const Component = () => {
  const { subproject_id, project_id } = useParams<{
    subproject_id: string
    project_id: string
  }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.goals.liveMany())

  const add = async () => {
    await db.goals.create({
      data: {
        goal_id: uuidv7(),
        subproject_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.goals.deleteMany()
  }

  const goals: Goal[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
        <button className="button" onClick={clear}>
          Clear
        </button>
      </div>
      {goals.map(
        (goal: Goal, index: number) => (
          <p key={index} className="item">
            <Link
              to={`/projects/${project_id}/subprojects/${subproject_id}/goals/${goal.goal_id}`}
            >
              {goal.goal_id}
            </Link>
          </p>
        ),
      )}
    </div>
  )
}
