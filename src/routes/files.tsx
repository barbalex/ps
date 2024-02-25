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
  const { project_id = null, subproject_id = null } = useParams()

  const { db } = useElectric()!
  const { results: files = [] } = useLiveQuery(
    db.files.liveMany({
      where: {
        deleted: false,
        project_id,
        subproject_id,
      },
      orderBy: { label: 'asc' },
    }),
  )

  const baseUrl = `${project_id ? `/projects/${project_id}` : ''}${
    subproject_id ? `/subprojects/${subproject_id}` : ''
  }/files`

  const add = useCallback(async () => {
    const data = await createFile({ db, project_id, subproject_id })
    await db.files.create({ data })
    navigate(`${baseUrl}/${data.file_id}`)
  }, [db, navigate])

  return (
    <div className="list-view">
      <ListViewHeader title="Files" addRow={add} tableName="file" />
      <div className="list-container">
        <lr-file-uploader-regular
          css-src="https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.32.4/web/lr-file-uploader-regular.min.css"
          ctx-name="uploadcare-uploader"
          class="uploadcare-uploader-config"
        ></lr-file-uploader-regular>
        {files.map(({ file_id, label }) => (
          <Row key={file_id} label={label} to={`${baseUrl}/${file_id}`} />
        ))}
      </div>
    </div>
  )
}
