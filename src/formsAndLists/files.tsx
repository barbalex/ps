import { useCallback, useContext, memo } from 'react'
import { Button } from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useFilesNavData } from '../modules/useFilesNavData.ts'
import { Uploader } from './file/Uploader.tsx'
import { UploaderContext } from '../UploaderContext.ts'

import '../form.css'

export const Files = memo(({ from }) => {
  const { isLoading, navData } = useFilesNavData({ from })

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
        countFiltered={navData.length}
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
        {isLoading ?
          <Loading />
        : <>
            {navData.map(({ file_id, label, url, mimetype }) => {
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
        }
      </div>
    </div>
  )
})
