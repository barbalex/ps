import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { createList } from '../../modules/createRows'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, list_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createList({ db, project_id })
    await db.lists.create({ data })
    navigate({
      pathname: `../${data.list_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.lists.delete({ where: { list_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.lists, list_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const lists = await db.lists.findMany({
      where: {  project_id },
      orderBy: { label: 'asc' },
    })
    const len = lists.length
    const index = lists.findIndex((p) => p.list_id === list_id)
    const next = lists[(index + 1) % len]
    navigate({
      pathname: `../${next.list_id}`,
      search: searchParams.toString(),
    })
  }, [db.lists, list_id, navigate, project_id, searchParams])

  const toPrevious = useCallback(async () => {
    const lists = await db.lists.findMany({
      where: {  project_id },
      orderBy: { label: 'asc' },
    })
    const len = lists.length
    const index = lists.findIndex((p) => p.list_id === list_id)
    const previous = lists[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.list_id}`,
      search: searchParams.toString(),
    })
  }, [db.lists, list_id, navigate, project_id, searchParams])

  return (
    <FormHeader
      title="List"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="list"
    />
  )
})
