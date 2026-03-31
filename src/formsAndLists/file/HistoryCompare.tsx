import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { HistoryCompare } from '../../components/shared/HistoryCompare/index.tsx'
import { createHistoryFieldLabelFormatter } from '../../components/shared/HistoryCompare/utils.ts'
import { stringifyHistoryValue } from '../../components/shared/HistoryCompare/utils.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { FileForm } from './index.tsx'
import { addOperationAtom } from '../../store.ts'
import {
  excludedDisplayFields,
  excludedRestoreFields,
  preferredOrder,
} from './historyCompareConfig.ts'

import type Files from '../../models/public/Files.ts'
import type FilesHistory from '../../models/public/FilesHistory.ts'

export const FileHistoryCompare = ({
  from,
}: {
  from:
    | '/data/projects/$projectId_/files/$fileId_/histories/$fileHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/files/$fileId_/histories/$fileHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/files/$fileId_/histories/$fileHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/files/$fileId_/histories/$fileHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/checks/$checkId_/files/$fileId_/histories/$fileHistoryId'
    | '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/checks/$checkId_/files/$fileId_/histories/$fileHistoryId'
}) => {
  const { formatMessage } = useIntl()
  const navigate = useNavigate()
  const {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    checkId,
    fileId,
    fileHistoryId,
  } = useParams({ from, strict: false })
  const filePath = actionId
    ? placeId2
      ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/actions/${actionId}/files/${fileId}`
      : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/actions/${actionId}/files/${fileId}`
    : checkId
      ? placeId2
        ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/checks/${checkId}/files/${fileId}`
        : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/checks/${checkId}/files/${fileId}`
      : subprojectId
        ? `/data/projects/${projectId}/subprojects/${subprojectId}/files/${fileId}`
        : `/data/projects/${projectId}/files/${fileId}`
  const historyPath = `${filePath}/histories`

  const addOperation = useSetAtom(addOperationAtom)
  const db = usePGlite()

  const rowRes = useLiveQuery(`SELECT * FROM files WHERE file_id = $1`, [fileId])
  const row = rowRes?.rows?.[0] as Files | undefined

  if (!rowRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: '9Gu1cL', defaultMessage: 'Datei' })}
        id={fileId}
      />
    )
  }

  const visibleCurrentFields = new Set([
    'name',
    'size',
    'mimetype',
    'url',
    'uuid',
    'preview_uuid',
    'width',
    'height',
    'data',
  ])

  const formatFieldLabel = createHistoryFieldLabelFormatter({
    formatMessage,
    fieldLabelMap: {
      name: { id: 'XkV5yZ', defaultMessage: 'Name' },
      size: { id: '2D6IvE', defaultMessage: 'Grösse' },
      mimetype: { id: 'DIgaIu', defaultMessage: 'Mimetype' },
      url: { id: 'TpzCEx', defaultMessage: 'Url' },
      uuid: { id: 'gw/Eg0', defaultMessage: 'Uuid' },
      preview_uuid: {
        id: 'bFilePreviewUuid',
        defaultMessage: 'Preview Uuid',
      },
      width: { id: 'bFileWidth', defaultMessage: 'Breite' },
      height: { id: 'bFileHeight', defaultMessage: 'Höhe' },
      data: { id: 'bDbEhF', defaultMessage: 'Daten' },
    },
  })

  const formatFieldValue = (field: string, history: FilesHistory) =>
    stringifyHistoryValue(history[field])

  return (
    <HistoryCompare<FilesHistory>
      onBack={() => navigate({ to: filePath })}
      leftContent={<FileForm row={row as Files & { id: Files['file_id'] }} from={from} withContainer={false} />}
      visibleCurrentFields={visibleCurrentFields}
      excludedDisplayFields={excludedDisplayFields}
      preferredOrder={preferredOrder}
      formatFieldLabel={formatFieldLabel}
      formatFieldValue={formatFieldValue}
      row={row}
      historyConfig={{
        historyTable: 'files_history',
        rowIdField: 'file_id',
        rowId: fileId,
        historyPath,
        routeHistoryId: fileHistoryId,
        currentRow: row,
      }}
      restoreConfig={{
        db,
        table: 'files',
        rowIdName: 'file_id',
        rowId: fileId,
        excludedRestoreFields,
        addOperation,
      }}
    />
  )
}
