import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createPlaceActionReportQuantity } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { placeActionReportId, placeActionReportQuantityId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const db = usePGlite()

  const placeActionReportQuantityIdRef = useRef(placeActionReportQuantityId)
  useEffect(() => {
    placeActionReportQuantityIdRef.current = placeActionReportQuantityId
  }, [placeActionReportQuantityId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM place_action_report_quantities WHERE place_action_report_id = $1`,
    [placeActionReportId],
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createPlaceActionReportQuantity({ placeActionReportId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, placeActionReportQuantityId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        'SELECT * FROM place_action_report_quantities WHERE place_action_report_quantity_id = $1',
        [placeActionReportQuantityId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(
        'DELETE FROM place_action_report_quantities WHERE place_action_report_quantity_id = $1',
        [placeActionReportQuantityId],
      )
      addOperation({
        table: 'place_action_report_quantities',
        rowIdName: 'place_action_report_quantity_id',
        rowId: placeActionReportQuantityId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting place action report quantity:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        'SELECT place_action_report_quantity_id FROM place_action_report_quantities WHERE place_action_report_id = $1 ORDER BY label',
        [placeActionReportId],
      )
      const quantities = res?.rows
      const len = quantities.length
      const index = quantities.findIndex(
        (p) => p.place_action_report_quantity_id === placeActionReportQuantityIdRef.current,
      )
      const next = quantities[(index + 1) % len]
      navigate({
        to: `../${next.place_action_report_quantity_id}`,
        params: (prev) => ({
          ...prev,
          placeActionReportQuantityId: next.place_action_report_quantity_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to next place action report quantity:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        'SELECT place_action_report_quantity_id FROM place_action_report_quantities WHERE place_action_report_id = $1 ORDER BY label',
        [placeActionReportId],
      )
      const quantities = res?.rows
      const len = quantities.length
      const index = quantities.findIndex(
        (p) => p.place_action_report_quantity_id === placeActionReportQuantityIdRef.current,
      )
      const previous = quantities[(index + len - 1) % len]
      navigate({
        to: `../${previous.place_action_report_quantity_id}`,
        params: (prev) => ({
          ...prev,
          placeActionReportQuantityId: previous.place_action_report_quantity_id,
        }),
      })
    } catch (error) {
      console.error(
        'Error navigating to previous place action report quantity:',
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
      tableName="place action report quantity"
    />
  )
}
