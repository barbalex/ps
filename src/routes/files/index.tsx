import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useParams } from 'react-router-dom'
// import { Button } from '@fluentui/react-components'

import { createFile } from '../../modules/createRows'
import { ListViewHeader } from '../../components/ListViewHeader'
import { Row } from '../../components/shared/Row'
import { Uploader } from './Uploader'

import '../../form.css'

import { useElectric } from '../../ElectricProvider'

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
  }, [baseUrl, db, navigate, project_id, subproject_id])

  // TODO: get uploader css locally if it should be possible to upload files
  // offline to sqlite
  return (
    <div className="list-view">
      <ListViewHeader title="Files" addRow={add} tableName="file" />
      <div className="list-container">
        <Uploader baseUrl={baseUrl} />
        {files.map(({ file_id, label }) => (
          <Row key={file_id} label={label} to={`${baseUrl}/${file_id}`} />
        ))}
      </div>
    </div>
  )
}
