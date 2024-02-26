import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { useResizeDetector } from 'react-resize-detector'

import { useElectric } from '../ElectricProvider'
import { Header } from './file/Header'
import { Uploader } from './file/Uploader'

import '../form.css'

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

  return (
    <div className="form-outer-container" ref={ref}>
      <Uploader />
      <Header />
      <div className="form-container">
        {(row.mimetype.includes('image') || row.mimetype.includes('pdf')) &&
          row.url &&
          width && (
            <img
              src={`${row.url}-/resize/${Math.floor(
                width,
              )}x/-/format/auto/-/quality/smart/`}
              alt={row.name}
            />
          )}
      </div>
    </div>
  )
})
