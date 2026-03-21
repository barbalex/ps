import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'

import { createActionReportQuantity } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'
import { useIntl } from 'react-intl'

export const Header = ({ autoFocusRef, from }) => {
  const { actionReportId, actionReportQuantityId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const db = usePGlite()

  // Keep a ref to the current actionReportQuantityId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const actionReportQuantityIdRef = useRef(actionReportQuantityId)
  useEffect(() => {
    actionReportQuantityIdRef.current = actionReportQuantityId
  }, [actionReportQuantityId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM action_report_quantities WHERE action_report_id = '${actionReportId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createActionReportQuantity({ actionReportId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, actionReportQuantityId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        'SELECT * FROM action_report_quantities WHERE action_report_quantity_id = $1',
        [actionReportQuantityId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(
        'DELETE FROM action_report_quantities WHERE action_report_quantity_id = $1',
        [actionReportQuantityId],
      )
      addOperation({
        table: 'action_report_quantities',
        rowIdName: 'action_report_quantity_id',
        rowId: actionReportQuantityId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting action report quantity:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        'SELECT action_report_quantity_id FROM action_report_quantities WHERE action_report_id = $1 ORDER BY label',
        [actionReportId],
      )
      const actionReportQuantities = res?.rows
      const len = actionReportQuantities.length
      const index = actionReportQuantities.findIndex(
        (p) =>
          p.action_report_quantity_id === actionReportQuantityIdRef.current,
      )
      const next = actionReportQuantities[(index + 1) % len]
      navigate({
        to: `../${next.action_report_quantity_id}`,
        params: (prev) => ({
          ...prev,
          actionReportQuantityId: next.action_report_quantity_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to next action report quantity:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        'SELECT action_report_quantity_id FROM action_report_quantities WHERE action_report_id = $1 ORDER BY label',
        [actionReportId],
      )
      const actionReportQuantities = res?.rows
      const len = actionReportQuantities.length
      const index = actionReportQuantities.findIndex(
        (p) =>
          p.action_report_quantity_id === actionReportQuantityIdRef.current,
      )
      const previous = actionReportQuantities[(index + len - 1) % len]
      navigate({
        to: `../${previous.action_report_quantity_id}`,
        params: (prev) => ({
          ...prev,
          actionReportQuantityId: previous.action_report_quantity_id,
        }),
      })
    } catch (error) {
      console.error(
        'Error navigating to previous action report quantity:',
        error,
      )
    }
  }

  return (
    <FormHeader
      title={formatMessage({
        id: 'TmPR2+',
        defaultMessage: 'Menge',
      })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="action report quantities"
    />
  )
}
