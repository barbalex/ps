import { useCallback, useEffect, useContext } from 'react'
import { useNavigate, useParams, useLocation } from '@tanstack/react-router'
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
import { setShortTermOnlineFromFetchError } from '../../modules/setShortTermOnlineFromFetchError.ts'

import '../../form.css'

export const Uploader = ({ from }) => {
  const navigate = useNavigate()
  const { projectId, subprojectId, placeId, placeId2, actionId, checkId } =
    useParams({ from })

  const { pathname } = useLocation()
  const isPreview = pathname.endsWith('preview')
  const isFileList = pathname.endsWith('files')

  // const isFile = pathname.endsWith('file')

  const db = usePGlite()
  const uploaderCtx = useContext(UploaderContext)
  const api = uploaderCtx?.current?.getAPI?.()

  // ISSUE: the event is called THREE times
  // Solution: query files with the uuid and only create if it doesn't exist
  const onUploadSuccess = async (event: CustomEvent) => {
    const resFiles = await db.query(`SELECT * FROM files WHERE uuid = $1`, [
      event.detail.uuid,
    ])
    const files = resFiles?.rows ?? []
    if (files.length) return

    const fileInput = {
      name: event.detail.name,
      size: event.detail.size,
      mimetype: event.detail.mimeType,
      url: event.detail.cdnUrl,
      uuid: event.detail.uuid,
      width: event.detail.fileInfo?.imageInfo?.width ?? null,
      height: event.detail.fileInfo?.imageInfo?.height ?? null,
    }
    if (actionId) {
      fileInput.actionId = actionId
    } else if (checkId) {
      fileInput.checkId = checkId
    } else if (placeId2) {
      fileInput.placeId = placeId2
    } else if (placeId) {
      fileInput.placeId = placeId
    } else if (subprojectId) {
      fileInput.subprojectId = subprojectId
    } else if (projectId) {
      fileInput.projectId = projectId
    }
    const fileId = await createFile(fileInput)
    navigate({
      to: `${!isFileList ? '.' : ''}./${fileId}${isPreview ? '/preview' : ''}`,
      params: (prev) => ({ ...prev, fileId }),
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
    try {
      await axios({
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
      setShortTermOnlineFromFetchError(error)
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
  }

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
