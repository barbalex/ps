import { useCallback, useMemo, useContext, memo } from 'react'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import { useParams } from 'react-router'
import { Button } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
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

  const { hKey, hValue } = useMemo(() => {
    if (action_id) {
      return { hKey: 'action_id', hValue: action_id }
    } else if (check_id) {
      return { hKey: 'check_id', hValue: check_id }
    } else if (place_id2) {
      return { hKey: 'place_id2', hValue: place_id2 }
    } else if (place_id) {
      return { hKey: 'place_id', hValue: place_id }
    } else if (subproject_id) {
      return { hKey: 'subproject_id', hValue: subproject_id }
    } else if (project_id) {
      return { hKey: 'project_id', hValue: project_id }
    }
  }, [action_id, check_id, place_id, place_id2, project_id, subproject_id])

  const res = useLiveIncrementalQuery(
    `SELECT file_id, label, url, mimetype FROM files WHERE ${hKey} = $1 ORDER BY label`,
    [hValue],
    'file_id',
  )
  const isLoading = res === undefined
  const files = res?.rows ?? []

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
        isLoading={isLoading}
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
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {files.map(({ file_id, label, url, mimetype }) => {
              let imgSrc = undefined
              if (
                (mimetype.includes('image') || mimetype.includes('pdf')) &&
                url
              ) {
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
          </>
        )}
      </div>
    </div>
  )
})
