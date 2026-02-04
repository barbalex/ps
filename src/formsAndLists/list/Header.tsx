import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'

import { createList } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const isForm = from === '/data/projects/$projectId_/lists/$listId_/list'
  const { projectId, listId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  // Keep a ref to the current listId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const listIdRef = useRef(listId)
  useEffect(() => {
    listIdRef.current = listId
  }, [listId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM lists WHERE project_id = '${projectId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createList({ projectId })
    if (!id) return
    navigate({
      to: isForm ? `../../${id}/list` : `../${id}/list`,
      params: (prev) => ({ ...prev, listId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(`SELECT * FROM lists WHERE list_id = $1`, [
        listId,
      ])
      const prev = prevRes?.rows?.[0] ?? {}
      db.query(`DELETE FROM lists WHERE list_id = $1`, [listId])
      addOperation({
        table: 'lists',
        rowIdName: 'list_id',
        rowId: listId,
        operation: 'delete',
        prev,
      })
      navigate({ to: isForm ? `../..` : `..` })
    } catch (error) {
      console.error(error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT list_id FROM lists WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const lists = res?.rows
      const len = lists.length
      const index = lists.findIndex((p) => p.list_id === listIdRef.current)
      const next = lists[(index + 1) % len]
      navigate({
        to: isForm ? `../../${next.list_id}/list` : `../${next.list_id}`,
        params: (prev) => ({ ...prev, listId: next.list_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT list_id FROM lists WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const lists = res?.rows
      const len = lists.length
      const index = lists.findIndex((p) => p.list_id === listIdRef.current)
      const previous = lists[(index + len - 1) % len]
      navigate({
        to: isForm ? `../../${previous.list_id}/list` : `../${previous.list_id}`,
        params: (prev) => ({ ...prev, listId: previous.list_id }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      title="List"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="list"
    />
  )
}
