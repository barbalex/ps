import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { useResizeDetector } from 'react-resize-detector'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'

import { useElectric } from '../../ElectricProvider'
import { Header } from '../file/Header'
import { Uploader } from '../file/Uploader'

import '../../form.css'
import './style.css'

const containerStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
}
const fileStyle = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
}
const imageStyle = {
  objectFit: 'contain',
  alignSelf: 'flex-start',
}
const textStyle = { alignSelf: 'center', margin: 'auto' }

export const Component = memo(() => {
  const { file_id } = useParams()

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.files.liveUnique({ where: { file_id } }),
  )

  const { width, height, ref } = useResizeDetector({
    // handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { leading: false, trailing: true },
  })

  if (!row) {
    return <div>Loading...</div>
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
    <div style={containerStyle}>
      <Uploader />
      <Header row={row} />
      <div style={fileStyle} ref={ref}>
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
          />
        )}
        {isNotViewable && (
          <div
            style={textStyle}
          >{`Files with mime type '${row.mimetype}' can't be previewed (yet)`}</div>
        )}
      </div>
    </div>
  )
})
