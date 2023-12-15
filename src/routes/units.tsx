import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link, useParams } from 'react-router-dom'

import { Units as Unit } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import '../User.css'

export const Component = () => {
  const { project_id } = useParams<{ project_id: string }>()
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.units.liveMany())

  const add = async () => {
    await db.units.create({
      data: {
        unit_id: uuidv7(),
        project_id,
        // TODO: add account_id
      },
    })
  }

  const clear = async () => {
    await db.units.deleteMany()
  }

  const units: Unit[] = results ?? []

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
      {units.map((unit: Unit, index: number) => (
        <p key={index} className="item">
          <Link to={`/projects/${project_id}/units/${unit.unit_id}`}>
            {unit.unit_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
