import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { ProjectUsers as ProjectUser } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { project_id, project_user_id } = useParams()
  const { results } = useLiveQuery(
    db.project_users.liveUnique({ where: { project_user_id } }),
  )

  const addItem = async () => {
    await db.project_users.create({
      data: {
        project_user_id: uuidv7(),
        project_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.project_users.deleteMany()
  }

  const projectUser: ProjectUser = results

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
      <div>{`Project User with id ${projectUser?.project_user_id ?? ''}`}</div>
    </div>
  )
}
