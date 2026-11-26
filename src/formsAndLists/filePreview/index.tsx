import { lazy, Suspense, useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtomValue } from 'jotai'

import { offlinePreviewUrl } from '../../modules/offlineFiles.ts'
import { offlineFilesStatusAtom } from '../../store.ts'
import { Header } from '../file/Header.tsx'
import { Uploader } from '../file/Uploader.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { useElementSize } from '../../modules/useElementSize.ts'
import { audioMimetypes, markdownMimetypes } from './mimetypes.ts'
import type Files from '../../models/public/Files.ts'

import '../../form.css'
import '@cyntler/react-doc-viewer/dist/index.css'
import styles from './index.module.css'

// the viewer is only used for a handful of mime types (images and PDFs use
// native elements) and pulls a large bundle, so it loads on demand — the
// default export is the wrapper that also registers the custom renderers
const DocViewer = lazy(() => import('./Viewer.tsx'))

export const FilePreview = ({ from }: { from: string }) => {
  const { fileId } = useParams({ strict: false })
  const previewRef = useRef<HTMLDivElement>(null)

  const res = useLiveQuery(`SELECT * FROM files WHERE file_id = $1`, [fileId])
  const row: Files | undefined = res?.rows?.[0] as Files | undefined

  const { width, height, ref } = useElementSize<HTMLDivElement>({ delay: 300 })
  // effectively offline (OfflineFilesManager): render the fixed preview URL
  // that is cached on the device
  const offlineStatuses = useAtomValue(offlineFilesStatusAtom)
  const isEffectivelyOffline =
    row !== undefined && row.file_id in offlineStatuses

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="File" id={fileId} />
  }

  const isImage = row.mimetype?.includes('image')
  const isPdf = row.mimetype?.includes('pdf')
  const isReactDocViewable =
    !isImage &&
    !isPdf &&
    row.mimetype &&
    [
      'text/csv',
      'application/vnd.oasis.opendocument.text',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/htm',
      'text/html',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      ...markdownMimetypes,
      ...audioMimetypes,
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
    ].includes(row.mimetype)
  const isNotViewable = !isImage && !isPdf && !isReactDocViewable

  return (
    <div ref={previewRef} className="form-outer-container">
      <div className={styles.hiddenUploader}>
        <Uploader
          projectId={row.project_id}
          subprojectId={row.subproject_id}
          placeId={row.place_id}
          actionId={row.action_id}
          checkId={row.check_id}
        />
      </div>
      <Header row={row} previewRef={previewRef} from={from} />
      <div className={styles.file} ref={ref}>
        {isImage && row.url && width && (
          <img
            src={
              isEffectivelyOffline ?
                offlinePreviewUrl(row.url)
              : `${row.url}-/preview/${Math.floor(width)}x${Math.floor(
                  height!,
                )}/-/format/auto/-/quality/smart/`
            }
            alt={row.name ?? undefined}
            width={width}
            height={
              row.width && row.height
                ? (width / row.width) * row.height
                : undefined
            }
            className={styles.image}
          />
        )}
        {isPdf && row.url && (
          <object
            data={row.url}
            type="application/pdf"
            width={width}
            className={styles.object}
          />
        )}
        {isReactDocViewable && row.url && (
          <div className={styles.object}>
            <Suspense fallback={<Loading />}>
              <DocViewer
                key={width ?? 0}
                documents={[
                  {
                    uri: row.url,
                    fileType: row.mimetype ?? undefined,
                  },
                ]}
                config={{ header: { disableHeader: true } }}
                className={styles.docViewer}
              />
            </Suspense>
          </div>
        )}
        {isNotViewable && (
          <div
            className={styles.text}
          >{`Files with mime type '${row.mimetype}' can't be previewed (yet)`}</div>
        )}
      </div>
    </div>
  )
}
