import { useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { useResizeDetector } from 'react-resize-detector'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Header } from '../file/Header.tsx'
import { Uploader } from '../file/Uploader.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import type Files from '../../models/public/Files.ts'

import '../../form.css'
import '@cyntler/react-doc-viewer/dist/index.css'
import styles from './index.module.css'

export const FilePreview = ({ from }) => {
  const { fileId } = useParams({ from })
  const previewRef = useRef<HTMLDivElement>(null)

  const res = useLiveQuery(`SELECT * FROM files WHERE file_id = $1`, [fileId])
  const row: Files | undefined = res?.rows?.[0]

  const { width, height, ref } = useResizeDetector({
    // handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { leading: false, trailing: true },
  })

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="File" id={fileId} />
  }

  const isImage = row.mimetype.includes('image')
  const isPdf = row.mimetype.includes('pdf')
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
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'video/mp4',
    ].includes(row.mimetype)
  const isNotViewable = !isImage && !isPdf && !isReactDocViewable

  return (
    <>
      <Uploader />
      <div ref={previewRef} className={styles.container}>
        <Header row={row} previewRef={previewRef} />
        <div className={styles.file} ref={ref}>
          {isImage && row.url && width && (
            <img
              src={`${row.url}-/preview/${Math.floor(width)}x${Math.floor(
                height,
              )}/-/format/auto/-/quality/smart/`}
              alt={row.name}
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
              style={{ width }}
              className={styles.object}
            />
          )}
          {isReactDocViewable && (
            <div className={styles.object}>
              <DocViewer
                key={width}
                documents={[
                  {
                    uri: row.url,
                    mimeType: row.mimetype,
                  },
                ]}
                renderers={DocViewerRenderers}
                config={{ header: { disableHeader: true } }}
                className={styles.docViewer}
              />
            </div>
          )}
          {isNotViewable && (
            <div
              className={styles.text}
            >{`Files with mime type '${row.mimetype}' can't be previewed (yet)`}</div>
          )}
        </div>
      </div>
    </>
  )
}
