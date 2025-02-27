import { memo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useResizeDetector } from 'react-resize-detector'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Header } from '../file/Header.tsx'
import { Uploader } from '../file/Uploader.tsx'
import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'
import './style.css'
import '@cyntler/react-doc-viewer/dist/index.css'

const containerStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}
const fileStyle = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'white',
}
const imageStyle = {
  objectFit: 'contain',
}
const textStyle = { alignSelf: 'center', paddingTop: '2em' }

export const Component = memo(() => {
  const { file_id } = useParams()
  const previewRef = useRef<HTMLDivElement>(null)

  const result = useLiveIncrementalQuery(
    `SELECT * FROM files WHERE file_id = $1`,
    [file_id],
    'file_id',
  )
  const row = result?.rows?.[0]

  const { width, height, ref } = useResizeDetector({
    // handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { leading: false, trailing: true },
  })

  if (!row) return <Loading />

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
      <div
        ref={previewRef}
        style={containerStyle}
      >
        <Header
          row={row}
          previewRef={previewRef}
        />
        <div
          style={fileStyle}
          ref={ref}
        >
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
              style={imageStyle}
            />
          )}
          {isPdf && row.url && (
            <object
              data={row.url}
              type="application/pdf"
              style={{
                width,
                height: '100%',
              }}
            />
          )}
          {isReactDocViewable && (
            <div style={{ height: '100%' }}>
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
                style={{ height: '100%' }}
                className="doc-viewer"
              />
            </div>
          )}
          {isNotViewable && (
            <div
              style={textStyle}
            >{`Files with mime type '${row.mimetype}' can't be previewed (yet)`}</div>
          )}
        </div>
      </div>
    </>
  )
})
