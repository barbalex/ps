import { useCallback, memo, useMemo, useContext } from 'react'
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from 'react-router-dom'
import { Button } from '@fluentui/react-components'
import { MdPreview, MdEditNote } from 'react-icons/md'

import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { Files as File } from '../../generated/client/index.ts'
import { UploaderContext } from '../../UploaderContext.ts'

interface Props {
  row: File
}

export const Header = memo(({ row }: Props) => {
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

  const { db } = useElectric()!

  // TODO: if is preview, add preview to the url

  const uploaderCtx = useContext(UploaderContext)
  console.log('Header, uploaderCtx', uploaderCtx)
  const addRow = useCallback(
    async () => uploaderCtx.current.initFlow(),
    [uploaderCtx],
  )

  const deleteRow = useCallback(async () => {
    await db.files.delete({ where: { file_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.files, file_id, navigate, searchParams])

  const where = useMemo(() => {
    const where = {}
    if (action_id) {
      where.action_id = action_id
    } else if (check_id) {
      where.check_id = check_id
    } else if (place_id2) {
      where.place_id2 = place_id2
    } else if (place_id) {
      where.place_id = place_id
    } else if (subproject_id) {
      where.subproject_id = subproject_id
    } else if (project_id) {
      where.project_id = project_id
    }
    return where
  }, [action_id, check_id, place_id, place_id2, project_id, subproject_id])

  const toNext = useCallback(async () => {
    const files = await db.files.findMany({
      where,
      orderBy: { label: 'asc' },
    })
    const len = files.length
    const index = files.findIndex((p) => p.file_id === file_id)
    const next = files[(index + 1) % len]
    navigate({
      pathname: `../${next.file_id}${isPreview ? '/preview' : ''}`,
      search: searchParams.toString(),
    })
  }, [db.files, where, navigate, isPreview, searchParams, file_id])

  const toPrevious = useCallback(async () => {
    const files = await db.files.findMany({
      where,
      orderBy: { label: 'asc' },
    })
    const len = files.length
    const index = files.findIndex((p) => p.file_id === file_id)
    const previous = files[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.file_id}${isPreview ? '/preview' : ''}`,
      search: searchParams.toString(),
    })
  }, [db.files, where, navigate, isPreview, searchParams, file_id])

  return (
    <FormHeader
      title={isPreview ? `File: ${row?.label ?? ''}` : 'File'}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="file"
      siblings={
        <Button
          title={isPreview ? 'View form' : 'View file'}
          icon={isPreview ? <MdEditNote /> : <MdPreview />}
          onClick={onClickPreview}
        />
      }
    />
  )
})
