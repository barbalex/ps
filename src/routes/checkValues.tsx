import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { CheckValues as CheckValue } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../form.css'

export const Component = () => {
  const { subproject_id, project_id, place_id, check_id } = useParams()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.check_values.liveMany())

  const add = async () => {
    await db.check_values.create({
      data: {
        check_value_id: uuidv7(),
        check_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }

  const checkValues: CheckValue[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {checkValues.map((checkValue: CheckValue, index: number) => (
        <p key={index} className="item">
          <Link
            to={`/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}/checks/${check_id}/values/${checkValue.check_value_id}`}
          >
            {checkValue.check_value_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
