import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { Files as File } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { file_id } = useParams()
  const { results } = useLiveQuery(db.files.liveUnique({ where: { file_id } }))

  const addItem = async () => {
    await db.files.create({
      data: {
        file_id: uuidv7(),
      },
    })
  }

  const clearItems = async () => {
    await db.files.deleteMany()
  }

  const file: File = results

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
      <div>{`File with id ${file?.file_id ?? ''}`}</div>
    </div>
  )
}
