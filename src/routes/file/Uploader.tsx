import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDebouncedCallback } from 'use-debounce'
import axios from 'redaxios'

import { createFile } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'

import '../../form.css'

export const Uploader = () => {
  const navigate = useNavigate()
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    action_id,
    check_id,
  } = useParams()

  const baseUrl = `${project_id ? `/projects/${project_id}` : ''}${
    subproject_id ? `/subprojects/${subproject_id}` : ''
  }/files`

  const { db } = useElectric()!
  const uploaderCtx = document.querySelector('#uploaderctx')

  // ISSUE: the event is called THREE times
  // Solution: query files with the uuid and only create if it doesn't exist
  const onUploadSuccess = useCallback(
    async (event: CustomEvent) => {
      const { results: files = [] } = await db.files.findMany({
        where: { uuid: event.detail.uuid, deleted: false },
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
      // close the uploader or it will be open when navigating to the list
      uploaderCtx.doneFlow()
      // clear the uploader or it will show the last uploaded file when opened next time
      // https://github.com/uploadcare/blocks/issues/219#issuecomment-1223881802
      uploaderCtx.uploadCollection.clearAll()
      // TODO: if is not an image, create a thumbnail
      // https://uploadcare.com/docs/transformations/document-conversion/#thumbnails
      // TODO: oops. as secret key is exposed, this should be done on a server
      let res
      try {
        res = await axios({
          method: 'POST',
          url: 'https://api.uploadcare.com/convert/document/',
          data: {
            paths: [`${event.detail.uuid}/document/-/format/jpeg/-/page/1/`],
            store: 1,
          },
          params,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Uploadcare.Simple ${YOUR_PUBLIC_KEY}:${YOUR_SECRET_KEY}`,
            Accept: 'application/vnd.uploadcare-v0.7+json',
          },
        })
      } catch (error) {}
      // works for:
      // - csv > pdf > ?
      // - doc > thumbnail
      // - docx > thumbnail
      // - docm > thumbnail
      // - md > pdf > ?
      // - msg > pdf > ?
      // - odp > pdf > ?
      // - ods > pdf > ?
      // - odt > pdf > ?
      // - pdf > thumbnail
      // - pps > pdf/png > ?
      // - ppt > pdf > ?
      // - pptx > pdf > ?
      // - txt > pdf > ?
      // - xls > pdf/png > ?
      // - xlsx > pdf/png > ?
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
      uploaderCtx,
    ],
  )

  // somehow this is called multiple times
  const onUploadSuccessDebounced = useDebouncedCallback(onUploadSuccess, 300)

  const onUploadFailed = useCallback(
    (event: CustomEvent) => console.error('Uploader, onUploadFailed', event),
    [],
  )

  useEffect(() => {
    uploaderCtx.addEventListener(
      'file-upload-success',
      onUploadSuccessDebounced,
    )
    uploaderCtx.addEventListener('file-upload-failed', onUploadFailed)
    return () => {
      uploaderCtx.removeEventListener(
        'file-upload-success',
        onUploadSuccessDebounced,
      )
      uploaderCtx.removeEventListener('file-upload-failed', onUploadFailed)
    }
  }, [onUploadFailed, onUploadSuccessDebounced, uploaderCtx])

  // docs: https://uploadcare.com/docs/file-uploader
  // TODO: get uploader css locally if it should be possible to upload files
  // offline to sqlite
  return (
    <lr-file-uploader-regular
      css-src="https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.32.4/web/lr-file-uploader-regular.min.css"
      ctx-name="uploadcare-uploader"
      class="uploadcare-uploader-config"
    >
      <lr-data-output
        ctx-name="uploadcare-uploader"
        ref={uploaderCtx}
      ></lr-data-output>
    </lr-file-uploader-regular>
  )
}
