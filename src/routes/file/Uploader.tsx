import { useCallback, useEffect, useContext } from 'react'
import {
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
} from 'react-router-dom'
import { useDebouncedCallback } from 'use-debounce'
import axios from 'redaxios'
import { usePGlite } from '@electric-sql/pglite-react'

// css is needed
// not using the rest of react-uploader though
// https://www.npmjs.com/package/@uploadcare/react-uploader
import '@uploadcare/react-uploader/core.css'
import './uploader.css'

import { createFile } from '../../modules/createRows.ts'
import { UploaderContext } from '../../UploaderContext.ts'

import '../../form.css'

export const Uploader = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    action_id,
    check_id,
  } = useParams()

  const { pathname } = useLocation()
  const isPreview = pathname.endsWith('preview')
  const isFileList = pathname.endsWith('files')

  // const isFile = pathname.endsWith('file')

  const db = usePGlite()
  const uploaderCtx = useContext(UploaderContext)
  const api = uploaderCtx?.current?.getAPI?.()

  // ISSUE: the event is called THREE times
  // Solution: query files with the uuid and only create if it doesn't exist
  const onUploadSuccess = useCallback(
    async (event: CustomEvent) => {
      const resFiles = await db.query(`SELECT * FROM files WHERE uuid = $1`, [
        event.detail.uuid,
      ])
      const files = resFiles?.rows ?? []
      if (files.length) return

      const fileInput = {
        db,
        name: event.detail.name,
        size: event.detail.size,
        mimetype: event.detail.mimeType,
        url: event.detail.cdnUrl,
        uuid: event.detail.uuid,
        width: event.detail.fileInfo?.imageInfo?.width ?? null,
        height: event.detail.fileInfo?.imageInfo?.height ?? null,
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
      const res1 = await createFile(fileInput)
      const data = res1?.rows?.[0]
      navigate({
        pathname: `${!isFileList ? '.' : ''}./${data.file_id}${
          isPreview ? '/preview' : ''
        }`,
        search: searchParams.toString(),
      })
      // close the uploader or it will be open when navigating to the list
      api?.doneFlow?.()
      // clear the uploader or it will show the last uploaded file when opened next time
      api?.removeAllFiles?.()

      return

      // TODO: if is not an image, create a thumbnail
      // https://uploadcare.com/docs/transformations/document-conversion/#thumbnails
      // TODO: oops. as secret key is exposed, this should be done on a server
      // So on the server:
      // - watch file inserts
      // - if file is not an image, create a thumbnail
      // - then update the file with preview_uuid
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
      } catch (error) {
        console.error('Uploader, error when creating thumbnails:', error)
      }
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
      api,
      check_id,
      db,
      isFileList,
      isPreview,
      navigate,
      place_id,
      place_id2,
      project_id,
      searchParams,
      subproject_id,
    ],
  )

  // somehow this is called multiple times
  const onUploadSuccessDebounced = useDebouncedCallback(onUploadSuccess, 300)

  const onUploadFailed = useCallback(
    (event: CustomEvent) => console.error('Uploader, onUploadFailed', event),
    [],
  )

  useEffect(() => {
    const ctx = uploaderCtx?.current
    ctx.addEventListener('file-upload-success', onUploadSuccessDebounced)
    ctx.addEventListener('file-upload-failed', onUploadFailed)
    return () => {
      ctx.removeEventListener('file-upload-success', onUploadSuccessDebounced)
      ctx.removeEventListener('file-upload-failed', onUploadFailed)
    }
  }, [onUploadFailed, onUploadSuccessDebounced, uploaderCtx])

  // docs: https://uploadcare.com/docs/file-uploader
  // TODO: get uploader css locally if it should be possible to upload files
  // offline to sqlite

  return (
    <uc-file-uploader-regular
      ctx-name="uploadcare-uploader"
      css-src="https://cdn.jsdelivr.net/npm/@uploadcare/file-uploader@v1/web/uc-file-uploader-regular.min.css"
      id="uploader"
    >
      <uc-data-input ctx-name="uploadcare-uploader"></uc-data-input>
    </uc-file-uploader-regular>
  )
}
