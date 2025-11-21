import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createList } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = ({ autoFocusRef, from }) => {
  const isForm = from === '/data/projects/$projectId_/lists/$listId_/list'
  const { projectId, listId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = async () => {
    const res = await createList({ db, projectId })
    const data = res?.rows?.[0]
    navigate({
      to: isForm ? `../../${data.list_id}/list` : `../${data.list_id}/list`,
      params: (prev) => ({ ...prev, listId: data.list_id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(`DELETE FROM lists WHERE list_id = $1`, [listId])
    navigate({ to: isForm ? `../..` : `..` })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT list_id FROM lists WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const lists = res?.rows
    const len = lists.length
    const index = lists.findIndex((p) => p.list_id === listId)
    const next = lists[(index + 1) % len]
    navigate({
      to: isForm ? `../../${next.list_id}/list` : `../${next.list_id}`,
      params: (prev) => ({ ...prev, listId: next.list_id }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT list_id FROM lists WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const lists = res?.rows
    const len = lists.length
    const index = lists.findIndex((p) => p.list_id === listId)
    const previous = lists[(index + len - 1) % len]
    navigate({
      to: isForm ? `../../${previous.list_id}/list` : `../${previous.list_id}`,
      params: (prev) => ({ ...prev, listId: previous.list_id }),
    })
  }

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
}
