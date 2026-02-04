import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'

import { createActionValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { actionId, actionValueId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  // Keep a ref to the current actionValueId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const actionValueIdRef = useRef(actionValueId)
  useEffect(() => {
    actionValueIdRef.current = actionValueId
  }, [actionValueId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM action_values WHERE action_id = '${actionId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createActionValue({ actionId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({
        ...prev,
        actionValueId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const resPrev = await db.query(
        'SELECT * FROM action_values WHERE action_value_id = $1',
        [actionValueId],
      )
      const prev = resPrev?.rows?.[0] ?? {}
      await db.query('DELETE FROM action_values WHERE action_value_id = $1', [
        actionValueId,
      ])
      addOperation({
        table: 'action_values',
        rowIdName: 'action_value_id',
        rowId: actionValueId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting action value:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        'SELECT action_value_id FROM action_values WHERE action_id = $1 ORDER BY label',
        [actionId],
      )
      const actionValues = res?.rows
      const len = actionValues.length
      const index = actionValues.findIndex(
        (p) => p.action_value_id === actionValueIdRef.current,
      )
      const next = actionValues[(index + 1) % len]
      navigate({
        to: `../${next.action_value_id}`,
        params: (prev) => ({
          ...prev,
          actionValueId: next.action_value_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to next action value:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        'SELECT action_value_id FROM action_values WHERE action_id = $1 ORDER BY label',
        [actionId],
      )
      const actionValues = res?.rows
      const len = actionValues.length
      const index = actionValues.findIndex(
        (p) => p.action_value_id === actionValueIdRef.current,
      )
      const previous = actionValues[(index + len - 1) % len]
      navigate({
        to: `../${previous.action_value_id}`,
        params: (prev) => ({
          ...prev,
          actionValueId: previous.action_value_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous action value:', error)
    }
  }

  return (
    <FormHeader
      title="Action Value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="action value"
    />
  )
}
