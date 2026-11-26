import { useLocation, useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createList } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { useRequestRowDelete } from '../../modules/deleteRow.ts'

export const Header = ({
  autoFocusRef,
  from: _from,
}: {
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  from?: string
  label?: string
}) => {
  const { projectId, listId } = useParams({ strict: false })
  const location = useLocation()
  const isForm = /\/lists\/[^/]+\/(list|values(\/|$))/.test(location.pathname)
  const navigate = useNavigate()
  const requestDelete = useRequestRowDelete()
  const { formatMessage } = useIntl()

  const db = usePGlite()
  const basePath = `/data/projects/${projectId}/lists/${listId}`
  const formPath = isForm ? `${basePath}/list` : basePath

  // Keep a ref to the current listId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const listIdRef = useRef(listId)
  useEffect(() => {
    listIdRef.current = listId
  }, [listId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM lists WHERE project_id = '${projectId}'`,
  )
  const rowCount = Number(countRes?.rows?.[0]?.count ?? 2)

  const addRow = async () => {
    const id = await createList({projectId: projectId! })
    if (!id) return
    navigate({
      to: '/data/projects/$projectId/lists/$listId/list',
      params: { projectId: projectId!, listId: id },
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () =>
    requestDelete({
      table: 'lists',
      rowIdName: 'list_id',
      rowId: listId!,
      navigateTo: isForm ? ('../..' as '..') : '..',
    })

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT list_id FROM lists WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const lists = res?.rows as { list_id: string }[]
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
      const lists = res?.rows as { list_id: string }[]
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
      title={formatMessage({ id: '4+BE1s', defaultMessage: 'Liste' })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="list"
      siblings={
        <HistoryToggleButton
          historiesPath={`${basePath}/histories`}
          formPath={formPath}
          historyTable="lists_history"
          rowIdField="list_id"
          rowId={listId}
        />
      }
    />
  )
}
