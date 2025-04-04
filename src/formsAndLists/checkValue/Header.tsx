import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createCheckValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef, from }) => {
  const { checkId, checkValueId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createCheckValue({ checkId, db })
    const checkValue = res?.rows?.[0]
    navigate({
      to: `../${checkValue.check_value_id}`,
      params: (prev) => ({ ...prev, checkValueId: checkValue.check_value_id }),
    })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, checkId, db, navigate])

  const deleteRow = useCallback(async () => {
    await db.query('DELETE FROM check_values WHERE check_value_id = $1', [
      checkValueId,
    ])
    navigate({ to: '..' })
  }, [checkValueId, db, navigate])

  const toNext = useCallback(async () => {
    const res = await db.query(
      'SELECT check_value_id FROM check_values WHERE check_id = $1 ORDER BY label',
      [checkId],
    )
    const checkValues = res?.rows
    const len = checkValues.length
    const index = checkValues.findIndex(
      (p) => p.check_value_id === checkValueId,
    )
    const next = checkValues[(index + 1) % len]
    navigate({
      to: `../${next.check_value_id}`,
      params: (prev) => ({ ...prev, checkValueId: next.check_value_id }),
    })
  }, [checkId, checkValueId, db, navigate])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      'SELECT check_value_id FROM check_values WHERE check_id = $1 ORDER BY label',
      [checkId],
    )
    const checkValues = res?.rows
    const len = checkValues.length
    const index = checkValues.findIndex(
      (p) => p.check_value_id === checkValueId,
    )
    const previous = checkValues[(index + len - 1) % len]
    navigate({
      to: `../${previous.check_value_id}`,
      params: (prev) => ({ ...prev, checkValueId: previous.check_value_id }),
    })
  }, [checkId, checkValueId, db, navigate])

  return (
    <FormHeader
      title="Check value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="check value"
    />
  )
})
