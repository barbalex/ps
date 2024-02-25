import { useCallback, useEffect } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@fluentui/react-components'

import '../../form.css'

import { useElectric } from '../../ElectricProvider'

export const Uploader = () => {
  const navigate = useNavigate()
  const { project_id = null, subproject_id = null } = useParams()

  const { db } = useElectric()!
  const uploaderCtx = document.querySelector('#uploaderctx')
  console.log('Uploader, uploaderCtx ', uploaderCtx)
  const collectionState = uploaderCtx.getOutputCollectionState()
  console.log('Uploader, collectionState ', collectionState)

  useEffect(() => {
    uploaderCtx.addEventListener('change', (event: CustomEvent) => {
      console.log('Uploader, change event', event)
      // TODO:
      // extract data from event
      // e.detail.isFailed, e.detail.isSuccess, e.detail.isUploading, e.detail.status
      // e.detail.allEntries[0]:
      // - uuid
      // - file.name
      // - fileInfo.mimeType or fileInfo.mime.mime?
    })
    return () => {
      ctx.removeEventListener('change', (event) => {})
    }
  }, [uploaderCtx])

  const onClick = useCallback(() => {
    uploaderCtx.initFlow()
  }, [uploaderCtx])

  // TODO: get uploader css locally if it should be possible to upload files
  // offline to sqlite
  return (
    <>
      <Button onClick={onClick}>Upload</Button>
      <lr-file-uploader-regular
        css-src="https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.32.4/web/lr-file-uploader-regular.min.css"
        ctx-name="uploadcare-uploader"
        class="uploadcare-uploader-config"
      ></lr-file-uploader-regular>
      {/* <Button>
          <lr-file-uploader-inline
            css-src="lr-file-uploader-inline.min.css"
            ctx-name="uploadcare-uploader"
            class="uploadcare-uploader-config"
          ></lr-file-uploader-inline>
        </Button> */}
    </>
  )
}
