import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { Files as File } from '../../../generated/client'
import { labelFromData } from '../modules/labelFromData'
import { file as createFilePreset } from '../modules/dataPresets'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.files.liveMany())

  const add = async () => {
    const newFile = createFilePreset()
    console.log('files, add, newFile:', newFile)
    await db.files.create({
      data: newFile,
    })
    navigate(`/files/${newFile.file_id}`)
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
          <Link to={`/files/${file.file_id}`}>
            {labelFromData({ data: file, table: 'files' })}
          </Link>
        </p>
      ))}
    </div>
  )
}
