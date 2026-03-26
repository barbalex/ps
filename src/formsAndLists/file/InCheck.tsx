import { useRef } from 'react'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { addOperationAtom } from '../../store.ts'
import type Files from '../../models/public/Files.ts'

import '../../form.css'

type FileRow = Files & { id: Files['file_id'] }

type Props = {
  fileId: string
  checkId: string
  from: string
  onClose: () => void
  onNavigate: (fileId: string) => void
}

export const FileInCheck = ({
  fileId,
  checkId,
  from,
  onClose,
  onNavigate,
}: Props) => {
  const { formatMessage } = useIntl()
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const fileIdRef = useRef(fileId)
  fileIdRef.current = fileId

  const res = useLiveQuery(
    `SELECT file_id as id, * FROM files WHERE file_id = $1`,
    [fileId],
  )
  const row: FileRow | undefined = res?.rows?.[0]

  const { width, ref } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { leading: false, trailing: true },
  })

  const toNext = async () => {
    const filesRes = await db.query(
      `SELECT file_id FROM files WHERE check_id = $1 ORDER BY label`,
      [checkId],
    )
    const fileIds: { file_id: string }[] = filesRes?.rows ?? []
    const len = fileIds.length
    const index = fileIds.findIndex((f) => f.file_id === fileIdRef.current)
    const next = fileIds[(index + 1) % len]
    onNavigate(next.file_id)
  }

  const toPrevious = async () => {
    const filesRes = await db.query(
      `SELECT file_id FROM files WHERE check_id = $1 ORDER BY label`,
      [checkId],
    )
    const fileIds: { file_id: string }[] = filesRes?.rows ?? []
    const len = fileIds.length
    const index = fileIds.findIndex((f) => f.file_id === fileIdRef.current)
    const previous = fileIds[(index + len - 1) % len]
    onNavigate(previous.file_id)
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(`SELECT * FROM files WHERE file_id = $1`, [
        fileId,
      ])
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM files WHERE file_id = $1`, [fileId])
      addOperation({
        table: 'file',
        rowIdName: 'file_id',
        rowId: fileId,
        operation: 'delete',
        prev,
      })
      onClose()
    } catch (error) {
      console.error(error)
    }
  }

  if (!res) return <Loading />

  return (
    <div className="form-outer-container" ref={ref}>
      <FormHeader
        title={formatMessage({ id: '9Gu1cL', defaultMessage: 'Datei' })}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="file"
      />
      <div className="form-container">
        {row &&
          (row.mimetype?.includes('image') || row.mimetype?.includes('pdf')) &&
          row.url &&
          width && (
            <img
              src={`${row.url}-/resize/${Math.floor(width)}x/-/format/auto/-/quality/smart/`}
              alt={row.name ?? ''}
            />
          )}
        {row && (
          <>
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
              label={formatMessage({
                id: 'DIgaIu',
                defaultMessage: 'Mimetype',
              })}
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
          </>
        )}
      </div>
    </div>
  )
}
