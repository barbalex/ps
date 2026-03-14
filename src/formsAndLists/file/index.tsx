import { useParams } from '@tanstack/react-router'
import { useResizeDetector } from 'react-resize-detector'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { Header } from './Header.tsx'
import { Uploader } from './Uploader.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import type Files from '../../models/public/Files.ts'

import '../../form.css'

// create type from Files with added file_id as id
type File = Files & { id: Files['file_id'] }

export const File = ({ from }) => {
  const { fileId } = useParams({ from })
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `
    SELECT file_id as id, * 
    FROM files 
    WHERE file_id = $1`,
    [fileId],
  )
  const row: File | undefined = res?.rows?.[0]

  const { width, ref } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { leading: false, trailing: true },
  })

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="File" id={fileId} />
  }

  return (
    <div className="form-outer-container" ref={ref}>
      <Uploader from={from} />
      <Header from={from} />
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
        <TextFieldInactive
          label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
          name="name"
          value={row.name ?? ''}
        />
        <TextFieldInactive
          label={formatMessage({ id: '2D6IvE', defaultMessage: 'Grösse' })}
          name="size"
          value={row.size ?? ''}
        />
        <TextFieldInactive
          label={formatMessage({ id: 'DIgaIu', defaultMessage: 'Mimetype' })}
          name="mimetype"
          value={row.mimetype ?? ''}
        />
        <TextFieldInactive
          label={formatMessage({ id: 'TpzCEx', defaultMessage: 'Url' })}
          name="url"
          value={row.url ?? ''}
        />
        <TextFieldInactive
          label={formatMessage({ id: 'gw/Eg0', defaultMessage: 'Uuid' })}
          name="uuid"
          value={row.uuid ?? ''}
        />
        <Jsonb
          table="files"
          idField="file_id"
          id={row.file_id}
          data={row.data ?? {}}
          from={from}
        />
      </div>
    </div>
  )
}
