import { useCallback, useMemo, useContext, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import { Button } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { Uploader } from './file/Uploader.tsx'
import { UploaderContext } from '../UploaderContext.ts'

import '../form.css'

export const Files = memo(({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, actionId, checkId } =
    useParams({ from })

  const { hKey, hValue } = useMemo(() => {
    if (actionId) {
      return { hKey: 'action_id', hValue: actionId }
    } else if (checkId) {
      return { hKey: 'check_id', hValue: checkId }
    } else if (placeId2) {
      return { hKey: 'place_id2', hValue: placeId2 }
    } else if (placeId) {
      return { hKey: 'place_id', hValue: placeId }
    } else if (subprojectId) {
      return { hKey: 'subproject_id', hValue: subprojectId }
    } else if (projectId) {
      return { hKey: 'project_id', hValue: projectId }
    }
    return { hKey: undefined, hValue: undefined }
  }, [actionId, checkId, placeId, placeId2, projectId, subprojectId])

  const sql = `
    SELECT file_id, label, url, mimetype 
    FROM files 
    ${hKey ? `WHERE ${hKey} = '${hValue}'` : ''}
    ORDER BY label`
  const res = useLiveQuery(sql)
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
