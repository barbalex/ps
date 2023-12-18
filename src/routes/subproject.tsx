import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Subprojects as Subproject } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { project_id, subproject_id } = useParams()
  const { results } = useLiveQuery(
    db.subprojects.liveUnique({ where: { subproject_id } }),
  )

  const addItem = async () => {
    await db.subprojects.create({
      data: {
        subproject_id: uuidv7(),
        project_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.subprojects.deleteMany()
  }

  const subproject: Subproject = results

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
      <div>{`Subproject with id ${subproject?.subproject_id ?? ''}`}</div>
    </div>
  )
}
