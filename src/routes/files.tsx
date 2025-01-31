import { useCallback, useMemo, useContext, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from 'react-router-dom'
import { Button } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Uploader } from './file/Uploader.tsx'
import { UploaderContext } from '../UploaderContext.ts'

import '../form.css'

export const Component = memo(() => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    action_id,
    check_id,
  } = useParams()

  const where = useMemo(() => {
    let where = ''
    if (action_id) {
      where = `action_id = ${action_id}`
    } else if (check_id) {
      where = `check_id = ${check_id}`
    } else if (place_id2) {
      where = `place_id2 = ${place_id2}`
    } else if (place_id) {
      where = `place_id = ${place_id}`
    } else if (subproject_id) {
      where = `subproject_id = ${subproject_id}`
    } else if (project_id) {
      where = `project_id = ${project_id}`
    }
    return where
  }, [action_id, check_id, place_id, place_id2, project_id, subproject_id])

  const result = useLiveQuery(
    `SELECT * FROM files${where ? ` WHERE ${where}` : ''}`,
  )
  const files = result?.rows ?? []

  const uploaderCtx = useContext(UploaderContext)
  const api = uploaderCtx?.current?.getAPI?.()
  const onClickAdd = useCallback(() => api?.initFlow?.(), [api])

  // TODO: get uploader css locally if it should be possible to upload files
  // offline to SQLite
  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Files"
        nameSingular="File"
        tableName="files"
        isFiltered={false}
        countFiltered={files.length}
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
              label={label ?? file_id}
              to={file_id}
              imgSrc={imgSrc}
              lastHasImages={true}
            />
          )
        })}
      </div>
    </div>
  )
})
