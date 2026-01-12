import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createActionValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { actionId, actionValueId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

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
        (p) => p.action_value_id === actionValueId,
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
        (p) => p.action_value_id === actionValueId,
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
      tableName="action value"
    />
  )
}
