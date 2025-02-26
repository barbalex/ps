import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createList } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, list_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createList({ db, project_id })
    const data = res?.rows?.[0]
    navigate({
      pathname: `../${data.list_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM lists WHERE list_id = $1`, [list_id])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, list_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT list_id FROM lists WHERE project_id = $1 ORDER BY label ASC`,
      [project_id],
    )
    const lists = res.rows
    const len = lists.length
    const index = lists.findIndex((p) => p.list_id === list_id)
    const next = lists[(index + 1) % len]
    navigate({
      pathname: `../${next.list_id}`,
      search: searchParams.toString(),
    })
  }, [db, list_id, navigate, project_id, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT list_id FROM lists WHERE project_id = $1 ORDER BY label ASC`,
      [project_id],
    )
    const lists = res.rows
    const len = lists.length
    const index = lists.findIndex((p) => p.list_id === list_id)
    const previous = lists[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.list_id}`,
      search: searchParams.toString(),
    })
  }, [db, list_id, navigate, project_id, searchParams])

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
