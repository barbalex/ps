import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useParams } from 'react-router-dom'

import { createFile } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const navigate = useNavigate()
  const { project_id } = useParams()

  const { db } = useElectric()!
  const { results: files = [] } = useLiveQuery(
    db.files.liveMany({
      where: { deleted: false, ...(project_id ? { project_id } : {}) },
      orderBy: { label: 'asc' },
    }),
  )

  const baseUrl = `${project_id ? `/projects/${project_id}` : ''}/files`

  const add = useCallback(async () => {
    const data = await createFile({ db, project_id })
    await db.files.create({ data })
    navigate(`${baseUrl}/${data.file_id}`)
  }, [db, navigate])

  return (
    <div className="list-view">
      <ListViewHeader title="Files" addRow={add} tableName="file" />
      <div className="list-container">
        {files.map(({ file_id, label }) => (
          <Row key={file_id} label={label} to={`${baseUrl}/${file_id}`} />
        ))}
      </div>
    </div>
  )
}
