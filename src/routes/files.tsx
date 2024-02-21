import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate } from 'react-router-dom'

import { Files as File } from '../../../generated/client'
import { createFile } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

import { useElectric } from '../ElectricProvider'

type FileResults = {
  results: File[]
}

export const Component = () => {
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: files = [] }: FileResults = useLiveQuery(
    db.files.liveMany({ where: { deleted: false }, orderBy: { label: 'asc' } }),
  )

  const add = useCallback(async () => {
    const data = await createFile({ db })
    await db.files.create({ data })
    navigate(`/files/${data.file_id}`)
  }, [db, navigate])

  return (
    <div className="list-view">
      <ListViewHeader title="Files" addRow={add} tableName="file" />
      <div className="list-container">
        {files.map(({ file_id, label }) => (
          <Row key={file_id} label={label} to={`/files/${file_id}`} />
        ))}
      </div>
    </div>
  )
}
