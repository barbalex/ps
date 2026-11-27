import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'
import { useAtomValue } from 'jotai'

import { fileThumbnailUrl, offlinePreviewUrl } from '../../modules/offlineFiles.ts'
import { MdPictureAsPdf } from 'react-icons/md'
import { offlineFilesStatusAtom } from '../../store.ts'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { Header } from './Header.tsx'
import { Uploader } from './Uploader.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { useElementSize } from '../../modules/useElementSize.ts'
import type Files from '../../models/public/Files.ts'

import '../../form.css'

// create type from Files with added file_id as id
type File = Files & { id: Files['file_id'] }

export const FileForm = ({
  row,
  from,
  withContainer = true,
}: {
  row: File
  from: string
  withContainer?: boolean
}) => {
  const { formatMessage } = useIntl()
  const { width, ref } = useElementSize<HTMLDivElement>({
    delay: 300,
    height: false,
  })
  // effectively offline (OfflineFilesManager): the fixed preview URL is the
  // one cached on the device — offline, only cached URLs render
  const isEffectivelyOffline = row.file_id in useAtomValue(offlineFilesStatusAtom)

  const pdfThumb = row.mimetype === 'application/pdf' && fileThumbnailUrl(row.url, row.mimetype, row.preview_uuid)
  const content = (
    <div className="form-container">
      {row.mimetype === 'application/pdf' && (
        <div>
          {pdfThumb ? (
            <img src={pdfThumb} alt={row.name ?? 'PDF'} height={50} />
          ) : (
            <MdPictureAsPdf aria-label="PDF" size={24} />
          )}
        </div>
      )}
      {row.mimetype?.includes('image') &&
        row.url &&
        width && (
          <img
            src={
              isEffectivelyOffline ?
                offlinePreviewUrl(row.url)
              : `${row.url}-/resize/${Math.floor(
                  width,
                )}x/-/format/auto/-/quality/smart/`
            }
            alt={row.name ?? undefined}
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
        data={(row.data ?? {}) as Record<string, unknown>}
        from={from!}
      />
    </div>
  )

  if (!withContainer) return content

  return (
    <div className="form-outer-container" ref={ref}>
      {content}
    </div>
  )
}

export const File = ({ from }: { from?: string }) => {
  const { fileId } = useParams({ strict: false })

  const res = useLiveQuery(
    `
    SELECT file_id as id, * 
    FROM files 
    WHERE file_id = $1`,
    [fileId],
  )
  const row: File | undefined = res?.rows?.[0] as File | undefined

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="File" id={fileId} />
  }

  return (
    <div className="form-outer-container">
      <Uploader
        projectId={row.project_id}
        subprojectId={row.subproject_id}
        placeId={row.place_id}
        actionId={row.action_id}
        checkId={row.check_id}
      />
      <Header row={row} from={from} />
      <FileForm row={row} from={from!} withContainer={false} />
    </div>
  )
}
