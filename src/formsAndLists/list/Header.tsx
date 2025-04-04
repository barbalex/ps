import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createList } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef, from }) => {
  const { projectId, listId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createList({ db, projectId })
    const data = res?.rows?.[0]
    navigate({
      to: `../${data.list_id}`,
      params: (prev) => ({ ...prev, listId: data.list_id }),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, projectId])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM lists WHERE list_id = $1`, [listId])
    navigate({ to: '..' })
  }, [db, listId, navigate])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT list_id FROM lists WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const lists = res?.rows
    const len = lists.length
    const index = lists.findIndex((p) => p.list_id === listId)
    const next = lists[(index + 1) % len]
    navigate({
      to: `../${next.list_id}`,
      params: (prev) => ({ ...prev, listId: next.list_id }),
    })
  }, [db, listId, navigate, projectId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT list_id FROM lists WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const lists = res?.rows
    const len = lists.length
    const index = lists.findIndex((p) => p.list_id === listId)
    const previous = lists[(index + len - 1) % len]
    navigate({
      to: `../${previous.list_id}`,
      params: (prev) => ({ ...prev, listId: previous.list_id }),
    })
  }, [db, listId, navigate, projectId])

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
