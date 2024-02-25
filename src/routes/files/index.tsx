import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { Button } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { ListViewHeader } from '../../components/ListViewHeader'
import { Row } from '../../components/shared/Row'
import { Uploader } from '../file/Uploader'

import '../../form.css'

import { useElectric } from '../../ElectricProvider'

export const Component = () => {
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

  const uploaderCtx = document.querySelector('#uploaderctx')
  const onClickAdd = useCallback(() => uploaderCtx.initFlow(), [uploaderCtx])

  // TODO: get uploader css locally if it should be possible to upload files
  // offline to sqlite
  return (
    <div className="list-view">
      <ListViewHeader
        title="Files"
        tableName="file"
        menus={
          <Button
            size="medium"
            title="add File"
            icon={<FaPlus />}
            onClick={onClickAdd}
          />
        }
      />
      <div className="list-container">
        <Uploader />
        {files.map((file) => {
          const { file_id, label, url, mimetype } = file
          let imgSrc = undefined
          if ((mimetype.includes('image') || mimetype.includes('pdf')) && url) {
            imgSrc = `${url}-/resize/x50/-/format/auto/-/quality/smart/`
          }
          return (
            <Row
              key={file_id}
              label={label}
              to={`${baseUrl}/${file_id}`}
              imgSrc={imgSrc}
            />
          )
        })}
      </div>
    </div>
  )
}
