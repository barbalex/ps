import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { SubprojectUsers as SubprojectUser } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { subproject_id, subproject_user_id } = useParams()
  const { results } = useLiveQuery(
    db.subproject_users.liveUnique({ where: { subproject_user_id } }),
  )

  const addItem = async () => {
    await db.subproject_users.create({
      data: {
        subproject_user_id: uuidv7(),
        subproject_id,
        deleted: false,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.subproject_users.deleteMany()
  }

  const subproject_user: SubprojectUser = results

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
      <div>{`Subproject User with id ${
        subproject_user?.subproject_user_id ?? ''
      }`}</div>
    </div>
  )
}
