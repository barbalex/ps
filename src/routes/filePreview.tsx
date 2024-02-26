import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { useResizeDetector } from 'react-resize-detector'

import { useElectric } from '../ElectricProvider'
import { Header } from './file/Header'
import { Uploader } from './file/Uploader'

import '../form.css'

const containerStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}
const fileStyle = {
  flexGrow: 1,
  display: 'flex',
}

export const Component = memo(() => {
  const { file_id } = useParams()

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.files.liveUnique({ where: { file_id } }),
  )

  const { width, ref } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { leading: false, trailing: true },
  })

  if (!row) {
    return <div>Loading...</div>
  }

  const isImage = row.mimetype.includes('image')
  const isPdf = row.mimetype.includes('pdf')

  return (
    <div style={containerStyle} ref={ref}>
      <Uploader />
      <Header row={row} />
      <div style={fileStyle}>
        {isImage && row.url && width && (
          <img
            src={`${row.url}-/resize/${Math.floor(
              width,
            )}x/-/format/auto/-/quality/smart/`}
            alt={row.name}
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
        {!isImage && !isPdf && (
          <div
            style={{ alignSelf: 'center', margin: 'auto' }}
          >{`Not an image or pdf. Files with mime type '${row.mimetype}' can't be previewed (yet)`}</div>
        )}
      </div>
    </div>
  )
})
