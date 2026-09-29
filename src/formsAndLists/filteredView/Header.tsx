import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createFilteredView } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'


export const Header = ({ autoFocusRef }: { autoFocusRef?: React.RefObject<HTMLInputElement | null> }) => {
  const { projectId, filteredViewId } = useParams({ strict: false })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const db = usePGlite()

  // Keep a ref to the current filteredViewId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const filteredViewIdRef = useRef(filteredViewId)
  useEffect(() => {
    filteredViewIdRef.current = filteredViewId
  }, [filteredViewId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM filtered_views WHERE project_id = $1`,
    [projectId],
  )
  const rowCount = Number(countRes?.rows?.[0]?.count ?? 2)

  const addRow = async () => {
    const id = await createFilteredView({ projectId: projectId! })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, filteredViewId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM filtered_views WHERE filtered_view_id = $1`,
        [filteredViewId],
      )
      const prev = (prevRes?.rows?.[0] ?? {}) as Record<string, unknown>
      await db.query(
        `DELETE FROM filtered_views WHERE filtered_view_id = $1`,
        [filteredViewId],
      )
      addOperation({
        table: 'filtered_views',
        rowIdName: 'filtered_view_id',
        rowId: filteredViewId,
        operation: 'delete',
        prev,
      })
      // remove the deleted view from the enabled maps on place levels
      await db.query(
        `UPDATE place_levels SET filtered_views = filtered_views - $1 WHERE project_id = $2`,
        [filteredViewId, projectId],
      )
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting filtered view:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT filtered_view_id FROM filtered_views WHERE project_id = $1 ORDER BY sort, label`,
        [projectId],
      )
      const views = res?.rows as { filtered_view_id: string }[]
      const len = views.length
      const index = views.findIndex(
        (p) => p.filtered_view_id === filteredViewIdRef.current,
      )
      const next = views[(index + 1) % len]
      navigate({
        to: `../${next.filtered_view_id}`,
        params: (prev) => ({ ...prev, filteredViewId: next.filtered_view_id }),
      })
    } catch (error) {
      console.error('Error navigating to next filtered view:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT filtered_view_id FROM filtered_views WHERE project_id = $1 ORDER BY sort, label`,
        [projectId],
      )
      const views = res?.rows as { filtered_view_id: string }[]
      const len = views.length
      const index = views.findIndex(
        (p) => p.filtered_view_id === filteredViewIdRef.current,
      )
      const previous = views[(index + len - 1) % len]
      navigate({
        to: `../${previous.filtered_view_id}`,
        params: (prev) => ({
          ...prev,
          filteredViewId: previous.filtered_view_id,
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
        defaultMessage: 'Gefilterte Ansicht',
      })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="filteredView"
    />
  )
}
