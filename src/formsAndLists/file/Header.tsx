import { useContext, useRef, useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button } = fluentUiReactComponents
import { MdPreview, MdEditNote, MdFileDownload, MdDownloadDone, MdDownloading, MdOfflinePin } from 'react-icons/md'
import { saveAs } from 'file-saver'
import { useIntl } from 'react-intl'

import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useAtomValue, useSetAtom } from 'jotai'

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { UploaderContext } from '../../UploaderContext.ts'
import { FullscreenControl } from './FullscreenControl.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { addNotificationAtom, offlineFilesStatusAtom } from '../../store.ts'
import { useRequestRowDelete } from '../../modules/deleteRow.ts'
import { filesScopeWhere } from '../../modules/filesScopeWhere.ts'
import { toggleFileOffline } from '../../modules/toggleFileOffline.ts'
import type Files from '../../models/public/Files.ts'

export const Header = ({
  row,
  previewRef,
}: {
  row: Files
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
  const requestDelete = useRequestRowDelete()
  const notify = useSetAtom(addNotificationAtom)
  const [downloading, setDownloading] = useState(false)

  const download = async () => {
    if (!row.url || downloading) return
    setDownloading(true)
    try {
      const response = await fetch(row.url)
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)
      saveAs(await response.blob(), row.name?.trim() || row.file_id)
    } catch (error) {
      notify({
        intent: 'error',
        title: formatMessage({ id: 'fileDownloadFailed', defaultMessage: 'Datei konnte nicht heruntergeladen werden' }),
        body: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setDownloading(false)
    }
  }

  // offline availability: the mark (files.offline) plus the project gate;
  // hidden entirely while the gate is off
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
      : row.offline ?
        formatMessage({
          id: 'offlineFileOnTitle',
          defaultMessage: 'Datei offline verfügbar (Klick: wieder entfernen)',
        })
      : formatMessage({
          id: 'offlineFileOffTitle',
          defaultMessage: 'Datei offline verfügbar machen',
        })

  const onClickOffline = async () => {
    try {
      await toggleFileOffline(row.file_id)
    } catch (error) {
      notify({ intent: 'error', body: error instanceof Error ? error.message : String(error) })
    }
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

  const deleteRow = () =>
    requestDelete({
      table: 'files',
      rowIdName: 'file_id',
      rowId: fileId!,
      navigateTo: isPreview ? ('../..' as '..') : '..',
    })

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
          <Button
            title={formatMessage({ id: 'fileDownload', defaultMessage: 'Datei herunterladen' })}
            icon={<MdFileDownload />}
            disabled={!row.url || downloading}
            onClick={download}
          />
          {gateOn && !!row.url && (
            <Button
              title={offlineTitle}
              aria-pressed={!!row.offline}
              icon={
                offlineStatus === 'downloading' ? (
                  <MdDownloading />
                ) : row.offline ? (
                  <MdDownloadDone />
                ) : (
                  <MdOfflinePin />
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
