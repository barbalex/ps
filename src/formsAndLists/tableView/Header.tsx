import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createTableView } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'


export const Header = ({ autoFocusRef }: { autoFocusRef?: React.RefObject<HTMLInputElement | null> }) => {
  const { projectId, tableName, tableViewId } = useParams({ strict: false })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const db = usePGlite()

  // Keep a ref to the current tableViewId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const tableViewIdRef = useRef(tableViewId)
  useEffect(() => {
    tableViewIdRef.current = tableViewId
  }, [tableViewId])

  // next/previous stay within the views of the same table
  const tableFilter = tableName ? `AND table_name = '${tableName}'` : ''
  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM table_views WHERE project_id = $1 ${tableFilter}`,
    [projectId],
  )
  const rowCount = Number(countRes?.rows?.[0]?.count ?? 2)

  const addRow = async () => {
    const id = await createTableView({
      projectId: projectId!,
      tableName: tableName ?? 'checks',
    })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, tableViewId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM table_views WHERE table_view_id = $1`,
        [tableViewId],
      )
      const prev = (prevRes?.rows?.[0] ?? {}) as Record<string, unknown>
      await db.query(
        `DELETE FROM table_views WHERE table_view_id = $1`,
        [tableViewId],
      )
      addOperation({
        table: 'table_views',
        rowIdName: 'table_view_id',
        rowId: tableViewId,
        operation: 'delete',
        prev,
      })
      // remove the deleted view from the enabled maps on place levels
      await db.query(
        `UPDATE place_levels SET table_views = table_views - $1 WHERE project_id = $2`,
        [tableViewId, projectId],
      )
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting filtered view:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT table_view_id FROM table_views WHERE project_id = $1 ${tableFilter} ORDER BY sort, label`,
        [projectId],
      )
      const views = res?.rows as { table_view_id: string }[]
      const len = views.length
      const index = views.findIndex(
        (p) => p.table_view_id === tableViewIdRef.current,
      )
      const next = views[(index + 1) % len]
      navigate({
        to: `../${next.table_view_id}`,
        params: (prev) => ({ ...prev, tableViewId: next.table_view_id }),
      })
    } catch (error) {
      console.error('Error navigating to next filtered view:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT table_view_id FROM table_views WHERE project_id = $1 ${tableFilter} ORDER BY sort, label`,
        [projectId],
      )
      const views = res?.rows as { table_view_id: string }[]
      const len = views.length
      const index = views.findIndex(
        (p) => p.table_view_id === tableViewIdRef.current,
      )
      const previous = views[(index + len - 1) % len]
      navigate({
        to: `../${previous.table_view_id}`,
        params: (prev) => ({
          ...prev,
          tableViewId: previous.table_view_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous filtered view:', error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({
        id: '5mN8vP',
        defaultMessage: 'Ansicht',
      })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="tableView"
    />
  )
}
