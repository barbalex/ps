import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Files as File } from '../../../generated/client'
import { file as createFilePreset } from '../modules/dataPresets'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { file_id } = useParams()
  const { results } = useLiveQuery(db.files.liveUnique({ where: { file_id } }))

  const addItem = async () => {
    const newFile = createFilePreset()
    await db.files.create({
      data: newFile,
    })
    navigate(`/files/${newFile.file_id}`)
  }

  const clearItems = async () => {
    await db.files.deleteMany()
    Navigate(`/files`)
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
