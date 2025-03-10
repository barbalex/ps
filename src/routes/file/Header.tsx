import { useCallback, memo, useMemo, useContext } from 'react'
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from 'react-router-dom'
import { Button } from '@fluentui/react-components'
import { MdPreview, MdEditNote } from 'react-icons/md'
import { usePGlite } from '@electric-sql/pglite-react'

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { UploaderContext } from '../../UploaderContext.ts'
import { FullscreenControl } from './FullscreenControl.tsx'

export const Header = memo(({ row, previewRef }) => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    action_id,
    check_id,
    file_id,
  } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { pathname } = useLocation()
  const isPreview = pathname.endsWith('preview')

  const onClickPreview = useCallback(() => {
    if (isPreview) {
      navigate({
        pathname: pathname.replace('/preview', ''),
        search: searchParams.toString(),
      })
    } else {
      navigate({
        pathname: `${pathname}/preview`,
        search: searchParams.toString(),
      })
    }
  }, [isPreview, navigate, pathname, searchParams])

  const db = usePGlite()

  // TODO: if is preview, add preview to the url

  const uploaderCtx = useContext(UploaderContext)
  const api = uploaderCtx?.current?.getAPI?.()

  const addRow = useCallback(async () => api.initFlow(), [api])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM files WHERE file_id = $1`, [file_id])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, file_id, navigate, searchParams])

  const { hFilterField, hFilterValue } = useMemo(() => {
    if (action_id) {
      return { hFilterField: 'action_id', hFilterValue: action_id }
    } else if (check_id) {
      return { hFilterField: 'check_id', hFilterValue: check_id }
    } else if (place_id2) {
      return { hFilterField: 'place_id2', hFilterValue: place_id2 }
    } else if (place_id) {
      return { hFilterField: 'place_id', hFilterValue: place_id }
    } else if (subproject_id) {
      return { hFilterField: 'subproject_id', hFilterValue: subproject_id }
    } else if (project_id) {
      return { hFilterField: 'project_id', hFilterValue: project_id }
    }
  }, [action_id, check_id, place_id, place_id2, project_id, subproject_id])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT * FROM files WHERE ${hFilterField} = $1 ORDER BY label`,
      [hFilterValue],
    )
    const rows = res?.rows ?? []
    const len = rows.length
    const index = rows.findIndex((p) => p.file_id === file_id)
    const next = rows[(index + 1) % len]
    navigate({
      pathname: `${isPreview ? '../' : ''}../${next.file_id}${
        isPreview ? '/preview' : ''
      }`,
      search: searchParams.toString(),
    })
  }, [
    db,
    hFilterField,
    hFilterValue,
    navigate,
    isPreview,
    searchParams,
    file_id,
  ])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT * FROM files WHERE ${hFilterField} = $1 ORDER BY label`,
      [hFilterValue],
    )
    const rows = res?.rows ?? []
    const len = rows.length
    const index = rows.findIndex((p) => p.file_id === file_id)
    const previous = rows[(index + len - 1) % len]
    navigate({
      pathname: `${isPreview ? '../' : ''}../${previous.file_id}${
        isPreview ? '/preview' : ''
      }`,
      search: searchParams.toString(),
    })
  }, [
    db,
    hFilterField,
    hFilterValue,
    navigate,
    isPreview,
    searchParams,
    file_id,
  ])

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
