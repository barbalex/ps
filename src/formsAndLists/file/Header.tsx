import { useContext, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { MdPreview, MdEditNote, MdFileDownload, MdDownloadDone, MdDownloading } from 'react-icons/md'
import { useIntl } from 'react-intl'

import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useAtomValue, useSetAtom } from 'jotai'

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { UploaderContext } from '../../UploaderContext.ts'
import { FullscreenControl } from './FullscreenControl.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { addOperationAtom, offlineFilesStatusAtom } from '../../store.ts'
import { filesScopeWhere } from '../../modules/filesScopeWhere.ts'
import { setFileOffline } from '../../modules/setFileOffline.ts'
import type Files from '../../models/public/Files.ts'

export const Header = ({
  row,
  previewRef,
}: {
  row?: Files
  previewRef?: React.RefObject<HTMLElement | null>
  from?: string
}) => {
  const {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    checkId,
    fileId,
  } = useParams({ strict: false })
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isPreview = pathname.endsWith('preview')
  const actionBasePath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/actions/${actionId}/files/${fileId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/actions/${actionId}/files/${fileId}`
  const checkBasePath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/checks/${checkId}/files/${fileId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/checks/${checkId}/files/${fileId}`
  const subprojectBasePath =
    `/data/projects/${projectId}/subprojects/${subprojectId}/files/${fileId}`
  const projectBasePath = `/data/projects/${projectId}/files/${fileId}`
  const { formatMessage } = useIntl()
  const addOperation = useSetAtom(addOperationAtom)

  // offline availability: the mark (files.offline) plus the project gate;
  // hidden entirely while the gate is off
  const resOfflineRow = useLiveQuery(
    `SELECT offline, url FROM files WHERE file_id = $1`,
    [fileId],
  )
  const offlineRow = resOfflineRow?.rows?.[0] as
    | { offline: boolean | null; url: string | null }
    | undefined
  const resGate = useLiveQuery(
    `SELECT files_offline FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const gateOn = resGate?.rows?.[0]?.files_offline === true
  const offlineStatus = useAtomValue(offlineFilesStatusAtom)[fileId ?? '']

  const offlineTitle =
    offlineStatus === 'downloading'
      ? formatMessage({
          id: 'offlineFileDownloadingTitle',
          defaultMessage: 'Datei wird für offline gespeichert …',
        })
      : offlineRow?.offline ?
        formatMessage({
          id: 'offlineFileOnTitle',
          defaultMessage: 'Datei offline verfügbar (Klick: wieder entfernen)',
        })
      : formatMessage({
          id: 'offlineFileOffTitle',
          defaultMessage: 'Datei offline verfügbar machen',
        })

  const onClickOffline = () => {
    if (!fileId || !offlineRow?.url) return
    void setFileOffline(fileId, !offlineRow.offline)
  }


  const onClickPreview = () => {
    if (isPreview) {
      navigate({ to: pathname.replace('/preview', '') })
    } else {
      navigate({ to: `${pathname}/preview` })
    }
  }

  const db = usePGlite()

  // Keep a ref to the current fileId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const fileIdRef = useRef(fileId)
  useEffect(() => {
    fileIdRef.current = fileId
  }, [fileId])

  // TODO: if is preview, add preview to the url

  // the context carries the ref object itself; UploaderContext is typed as the element
  const uploaderCtx = useContext(UploaderContext) as unknown as {
    current?: { getAPI?: () => { initFlow?: () => void } } | null
  } | null
  const api = uploaderCtx?.current?.getAPI?.()

  const addRow = () => api?.initFlow?.()

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(`SELECT * FROM files WHERE file_id = $1`, [
        fileId,
      ])
      const prev = (prevRes?.rows?.[0] ?? {}) as Record<string, unknown>
      db.query(`DELETE FROM files WHERE file_id = $1`, [fileId])
      addOperation({
        table: 'file',
        rowIdName: 'file_id',
        rowId: fileId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error(error)
    }
  }

  // same scope as the files list this file was opened from
  const scope = filesScopeWhere({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    checkId,
  })

  const toNext = async () => {
    try {
      const res = await db.query(
        `
      SELECT file_id 
      FROM files 
      WHERE ${scope}
      ORDER BY label`,
      )
      const fileIds = (res?.rows ?? []) as { file_id: string }[]
      const len = fileIds.length
      const index = fileIds.findIndex((p) => p.file_id === fileIdRef.current)
      const next = fileIds[(index + 1) % len]
      navigate({
        to: `${isPreview ? '../' : ''}../${next.file_id}${
          isPreview ? '/preview' : ''
        }`,
        params: (prev) => ({ ...prev, fileId: next.file_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `
      SELECT file_id 
      FROM files 
      WHERE ${scope}
      ORDER BY label`,
      )
      const fileIds = (res?.rows ?? []) as { file_id: string }[]
      const len = fileIds.length
      const index = fileIds.findIndex((p) => p.file_id === fileIdRef.current)
      const previous = fileIds[(index + len - 1) % len]
      navigate({
        to: `${isPreview ? '../' : ''}../${previous.file_id}${
          isPreview ? '/preview' : ''
        }`,
        params: (prev) => ({ ...prev, fileId: previous.file_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      title={
        isPreview
          ? formatMessage({ id: 'ndNatR', defaultMessage: 'Datei: {label}' }, { label: row?.label ?? '' })
          : formatMessage({ id: '9Gu1cL', defaultMessage: 'Datei' })
      }
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="file"
      siblings={
        <>
          {gateOn && !!offlineRow?.url && (
            <Button
              title={offlineTitle}
              icon={
                offlineStatus === 'downloading' ? (
                  <MdDownloading />
                ) : offlineRow.offline ? (
                  <MdDownloadDone />
                ) : (
                  <MdFileDownload />
                )
              }
              onClick={onClickOffline}
            />
          )}
          <Button
            title={
              isPreview
                ? formatMessage({ id: '9NCbxo', defaultMessage: 'Formular anzeigen' })
                : formatMessage({ id: 'OOvRTo', defaultMessage: 'Datei anzeigen' })
            }
            icon={isPreview ? <MdEditNote /> : <MdPreview />}
            onClick={onClickPreview}
          />
          {isPreview && <FullscreenControl previewRef={previewRef} />}
          {!!actionId && (
            <HistoryToggleButton
              historiesPath={`${actionBasePath}/histories`}
              formPath={actionBasePath}
              historyTable="files_history"
              rowIdField="file_id"
              rowId={fileId}
            />
          )}
          {!!checkId && (
            <HistoryToggleButton
              historiesPath={`${checkBasePath}/histories`}
              formPath={checkBasePath}
              historyTable="files_history"
              rowIdField="file_id"
              rowId={fileId}
            />
          )}
          {!!projectId && !subprojectId && !placeId && !actionId && !checkId && (
            <HistoryToggleButton
              historiesPath={`${projectBasePath}/histories`}
              formPath={projectBasePath}
              historyTable="files_history"
              rowIdField="file_id"
              rowId={fileId}
            />
          )}
          {!!projectId && !!subprojectId && !placeId && !actionId && !checkId && (
            <HistoryToggleButton
              historiesPath={`${subprojectBasePath}/histories`}
              formPath={subprojectBasePath}
              historyTable="files_history"
              rowIdField="file_id"
              rowId={fileId}
            />
          )}
        </>
      }
    />
  )
}
