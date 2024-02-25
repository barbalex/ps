import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@fluentui/react-components'

import { createFile } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'

import '../../form.css'

export const Uploader = ({ baseUrl }) => {
  const navigate = useNavigate()
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    action_id,
    check_id,
  } = useParams()

  const { db } = useElectric()!
  const uploaderCtx = document.querySelector('#uploaderctx')

  // ISSUE: the event is called THREE times
  // Solution: query files with the uuid and only create if it doesn't exist
  const onUploadSuccess = useCallback(
    async (event: CustomEvent) => {
      console.log('Uploader, onUploadSuccess', event)
      const { results: files = [] } = await db.files.findMany({
        where: { uuid: event.detail.uuid, deleted: false },
      })
      console.log('hello Uploader, onUploadSuccess, files:', {
        files,
        event,
        uuid: event.detail.uuid,
      })
      if (files.length) return

      const fileInput = {
        db,
        name: event.detail.name,
        size: event.detail.size,
        mimetype: event.detail.mimeType,
        url: event.detail.cdnUrl,
        uuid: event.detail.uuid,
      }
      if (action_id) {
        fileInput.action_id = action_id
      } else if (check_id) {
        fileInput.check_id = check_id
      } else if (place_id2) {
        fileInput.place_id = place_id2
      } else if (place_id) {
        fileInput.place_id = place_id
      } else if (subproject_id) {
        fileInput.subproject_id = subproject_id
      } else if (project_id) {
        fileInput.project_id = project_id
      }
      const data = await createFile(fileInput)
      await db.files.create({ data })
      navigate(`${baseUrl}/${data.file_id}`)
    },
    [
      action_id,
      baseUrl,
      check_id,
      db,
      navigate,
      place_id,
      place_id2,
      project_id,
      subproject_id,
    ],
  )

  const onUploadFailed = useCallback(
    (event: CustomEvent) => console.error('Uploader, onUploadFailed', event),
    [],
  )

  useEffect(() => {
    uploaderCtx.addEventListener('file-upload-success', onUploadSuccess)
    uploaderCtx.addEventListener('file-upload-failed', onUploadFailed)
    return () => {
      uploaderCtx.removeEventListener('file-upload-success', onUploadSuccess)
      uploaderCtx.removeEventListener('file-upload-failed', onUploadFailed)
    }
  }, [onUploadFailed, onUploadSuccess, uploaderCtx])

  // TODO: get uploader css locally if it should be possible to upload files
  // offline to sqlite
  return (
    <>
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
