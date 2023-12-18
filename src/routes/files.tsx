import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { Link } from 'react-router-dom'

import { Files as File } from '../../../generated/client'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.files.liveMany())

  const add = async () => {
    await db.files.create({
      data: {
        file_id: uuidv7(),
      },
    })
  }

  const clear = async () => {
    await db.files.deleteMany()
  }

  const files: File[] = results ?? []

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
      {files.map((file: File, index: number) => (
        <p key={index} className="item">
          <Link to={`/files/${file.file_id}`}>{file.file_id}</Link>
        </p>
      ))}
    </div>
  )
}
