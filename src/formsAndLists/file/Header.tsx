import { useContext } from 'react'
import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import { Button } from '@fluentui/react-components'
import { MdPreview, MdEditNote } from 'react-icons/md'
import { usePGlite } from '@electric-sql/pglite-react'

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { UploaderContext } from '../../UploaderContext.ts'
import { FullscreenControl } from './FullscreenControl.tsx'

export const Header = ({ row, previewRef, from }) => {
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

  const onClickPreview = () => {
    if (isPreview) {
      navigate({ to: pathname.replace('/preview', '') })
    } else {
      navigate({ to: `${pathname}/preview` })
    }
  }

  const db = usePGlite()

  // TODO: if is preview, add preview to the url

  const uploaderCtx = useContext(UploaderContext)
  const api = uploaderCtx?.current?.getAPI?.()

  const addRow = () => api.initFlow()

  const deleteRow = () => {
    db.query(`DELETE FROM files WHERE file_id = $1`, [fileId])
    navigate({ to: '..' })
  }

  const hFilterField =
    actionId ? 'action_id'
    : checkId ? 'check_id'
    : placeId2 ? 'place_id'
    : placeId ? 'place_id'
    : subprojectId ? 'subproject_id'
    : projectId ? 'project_id'
    : undefined

  const hFilterValue =
    actionId ??
    checkId ??
    placeId2 ??
    placeId ??
    subprojectId ??
    projectId ??
    undefined

  const toNext = async () => {
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
  }

  const toPrevious = async () => {
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
  }

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
}
