import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { Checks as Check } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id, place_id } = useParams()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.checks.liveMany())

  const add = async () => {
    await db.checks.create({
      data: {
        check_id: uuidv7(),
        place_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }

  const checks: Check[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {checks.map((check: Check, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check.check_id}`}
          >
            {check.check_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
