import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = ({ autoFocusRef, from }) => {
  const { actionId, actionValueId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = async () => {
    const res = await createActionValue({ db, actionId })
    const actionValue = res?.rows?.[0]
    navigate({
      to: `../${actionValue.action_value_id}`,
      params: (prev) => ({
        ...prev,
        actionValueId: actionValue.action_value_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query('DELETE FROM action_values WHERE action_value_id = $1', [
      actionValueId,
    ])
    navigate({ to: '..' })
  }

  const toNext = async () => {
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
  }

  const toPrevious = async () => {
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
