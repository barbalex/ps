import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { Link, useNavigate } from 'react-router-dom'

import { Files as File } from '../../../generated/client'
import { createFile } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(db.files.liveMany())

  const add = useCallback(async () => {
    const data = await createFile({ db })
    await db.files.create({ data })
    navigate(`/files/${data.file_id}`)
  }, [db, navigate])

  const files: File[] = results ?? []

  return (
    <div className="list-view">
      <ListViewHeader title="Files" addRow={add} tableName="file" />
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
