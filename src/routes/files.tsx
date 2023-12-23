import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { Files as File } from '../../../generated/client'
import { file as createFilePreset } from '../modules/dataPresets'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.files.liveMany())

  const add = useCallback(async () => {
    const newFile = createFilePreset()
    await db.files.create({
      data: newFile,
    })
    navigate(`/files/${newFile.file_id}`)
  }, [db.files, navigate])

  const files: File[] = results ?? []

  return (
    <div className="form-container">
      <div className="controls">
        <button className="button" onClick={add}>
          Add
        </button>
      </div>
      {files.map((file: File, index: number) => (
        <p key={index} className="item">
          <Link to={`/files/${file.file_id}`}>
            {file.label ?? file.file_id}
          </Link>
        </p>
      ))}
    </div>
  )
}
