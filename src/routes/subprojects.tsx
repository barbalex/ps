import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { Subprojects as Subproject } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../User.css'

export const Component = () => {
  const { project_id } = useParams<{ project_id: string }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.subprojects.liveMany())

  const add = async () => {
    await db.subprojects.create({
      data: {
        subproject_id: uuidv7(),
        project_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.subprojects.deleteMany()
  }

  const subprojects: Subproject[] = results ?? []

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
      {subprojects.map((subproject: Subproject, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${subproject.project_id}/subprojects/${subproject.subproject_id}`}
          >
            {subproject.subproject_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
