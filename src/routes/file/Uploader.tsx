import { useCallback, useEffect } from 'react'
import {
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
} from 'react-router-dom'
import { useDebouncedCallback } from 'use-debounce'
import axios from 'redaxios'

import { createFile } from '../../modules/createRows.ts'
import { useElectric } from '../../ElectricProvider.tsx'

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

  const { db } = useElectric()!
  const uploaderCtx = {} // TODO: migrate

  // ISSUE: the event is called THREE times
  // Solution: query files with the uuid and only create if it doesn't exist
  const onUploadSuccess = useCallback(
    async (event: CustomEvent) => {
      const { results: files = [] } = await db.files.findMany({
        where: { uuid: event.detail.uuid },
      })
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
      const data = await createFile(fileInput)
      await db.files.create({ data })
      navigate({
        pathname: `./${data.file_id}${isPreview ? '/preview' : ''}`,
        search: searchParams.toString(),
      })
      // close the uploader or it will be open when navigating to the list
      uploaderCtx.current.doneFlow()
      // clear the uploader or it will show the last uploaded file when opened next time
      // https://github.com/uploadcare/blocks/issues/219#issuecomment-1223881802
      uploaderCtx.current.uploadCollection.clearAll()

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      check_id,
      db,
      isPreview,
      navigate,
      place_id,
      place_id2,
      project_id,
      searchParams,
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
    const ctx = uploaderCtx?.current
    ctx?.addEventListener?.('file-upload-success', onUploadSuccessDebounced)
    ctx?.addEventListener?.('file-upload-failed', onUploadFailed)
    return () => {
      ctx?.removeEventListener?.(
        'file-upload-success',
        onUploadSuccessDebounced,
      )
      ctx?.removeEventListener?.('file-upload-failed', onUploadFailed)
    }
  }, [onUploadFailed, onUploadSuccessDebounced, uploaderCtx])

  // docs: https://uploadcare.com/docs/file-uploader
  // TODO: get uploader css locally if it should be possible to upload files
  // offline to SQLite
  return (
    <>
      <lr-file-uploader-regular
        ctx-name="uploadcare-uploader"
        class="uploadcare-uploader-config"
      >
        <lr-data-output
          ctx-name="uploadcare-uploader"
          ref={uploaderCtx.current}
        ></lr-data-output>
      </lr-file-uploader-regular>
    </>
  )
}
