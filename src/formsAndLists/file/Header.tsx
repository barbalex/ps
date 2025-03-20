import { useCallback, memo, useMemo, useContext } from 'react'
import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import { Button } from '@fluentui/react-components'
import { MdPreview, MdEditNote } from 'react-icons/md'
import { usePGlite } from '@electric-sql/pglite-react'

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { UploaderContext } from '../../UploaderContext.ts'
import { FullscreenControl } from './FullscreenControl.tsx'

export const Header = memo(({ row, previewRef, from }) => {
  const {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
    checkId,
    fileId,
  } = useParams({ from })
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isPreview = pathname.endsWith('preview')

  const onClickPreview = useCallback(() => {
    if (isPreview) {
      navigate({ to: pathname.replace('/preview', '') })
    } else {
      navigate({ to: `${pathname}/preview` })
    }
  }, [isPreview, navigate, pathname])

  const db = usePGlite()

  // TODO: if is preview, add preview to the url

  const uploaderCtx = useContext(UploaderContext)
  const api = uploaderCtx?.current?.getAPI?.()

  const addRow = useCallback(async () => api.initFlow(), [api])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM files WHERE file_id = $1`, [fileId])
    navigate({ to: '..' })
  }, [db, fileId, navigate])

  const { hFilterField, hFilterValue } = useMemo(() => {
    if (actionId) {
      return { hFilterField: 'action_id', hFilterValue: actionId }
    } else if (checkId) {
      return { hFilterField: 'check_id', hFilterValue: checkId }
    } else if (placeId2) {
      return { hFilterField: 'place_id2', hFilterValue: placeId2 }
    } else if (placeId) {
      return { hFilterField: 'place_id', hFilterValue: placeId }
    } else if (subprojectId) {
      return { hFilterField: 'subproject_id', hFilterValue: subprojectId }
    } else if (projectId) {
      return { hFilterField: 'project_id', hFilterValue: projectId }
    }
    return { hFilterField: undefined, hFilterValue: undefined }
  }, [actionId, checkId, placeId, placeId2, projectId, subprojectId])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `
      SELECT file_id 
      FROM files 
      ${hFilterField ? `WHERE ${hFilterField} = '${hFilterValue}'` : ''} 
      ORDER BY label`,
    )
    const rows = res?.rows ?? []
    const len = rows.length
    const index = rows.findIndex((p) => p.file_id === fileId)
    const next = rows[(index + 1) % len]
    navigate({
      to: `${isPreview ? '../' : ''}../${next.file_id}${
        isPreview ? '/preview' : ''
      }`,
      params: (prev) => ({ ...prev, fileId: next.file_id }),
    })
  }, [db, hFilterField, hFilterValue, navigate, isPreview, fileId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `
      SELECT file_id 
      FROM files 
      ${hFilterField ? `WHERE ${hFilterField} = '${hFilterValue}'` : ''} 
      ORDER BY label`,
    )
    const rows = res?.rows ?? []
    const len = rows.length
    const index = rows.findIndex((p) => p.file_id === fileId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: `${isPreview ? '../' : ''}../${previous.file_id}${
        isPreview ? '/preview' : ''
      }`,
      params: (prev) => ({ ...prev, fileId: previous.file_id }),
    })
  }, [db, hFilterField, hFilterValue, navigate, isPreview, fileId])

  return (
    <FormHeader
      title={isPreview ? `File: ${row?.label ?? ''}` : 'File'}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="file"
      siblings={
        <>
          <Button
            title={isPreview ? 'View form' : 'View file'}
            icon={isPreview ? <MdEditNote /> : <MdPreview />}
            onClick={onClickPreview}
          />
          {isPreview && <FullscreenControl previewRef={previewRef} />}
        </>
      }
    />
  )
})
