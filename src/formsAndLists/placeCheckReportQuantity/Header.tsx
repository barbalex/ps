import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createPlaceCheckReportQuantity } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { placeCheckReportId, placeCheckReportQuantityId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const db = usePGlite()

  const placeCheckReportQuantityIdRef = useRef(placeCheckReportQuantityId)
  useEffect(() => {
    placeCheckReportQuantityIdRef.current = placeCheckReportQuantityId
  }, [placeCheckReportQuantityId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM place_check_report_quantities WHERE place_check_report_id = '${placeCheckReportId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createPlaceCheckReportQuantity({ placeCheckReportId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, placeCheckReportQuantityId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        'SELECT * FROM place_check_report_quantities WHERE place_check_report_quantity_id = $1',
        [placeCheckReportQuantityId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(
        'DELETE FROM place_check_report_quantities WHERE place_check_report_quantity_id = $1',
        [placeCheckReportQuantityId],
      )
      addOperation({
        table: 'place_check_report_quantities',
        rowIdName: 'place_check_report_quantity_id',
        rowId: placeCheckReportQuantityId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting place report quantity:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        'SELECT place_check_report_quantity_id FROM place_check_report_quantities WHERE place_check_report_id = $1 ORDER BY label',
        [placeCheckReportId],
      )
      const quantities = res?.rows
      const len = quantities.length
      const index = quantities.findIndex(
        (p) => p.place_check_report_quantity_id === placeCheckReportQuantityIdRef.current,
      )
      const next = quantities[(index + 1) % len]
      navigate({
        to: `../${next.place_check_report_quantity_id}`,
        params: (prev) => ({
          ...prev,
          placeCheckReportQuantityId: next.place_check_report_quantity_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to next place report quantity:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        'SELECT place_check_report_quantity_id FROM place_check_report_quantities WHERE place_check_report_id = $1 ORDER BY label',
        [placeCheckReportId],
      )
      const quantities = res?.rows
      const len = quantities.length
      const index = quantities.findIndex(
        (p) => p.place_check_report_quantity_id === placeCheckReportQuantityIdRef.current,
      )
      const previous = quantities[(index + len - 1) % len]
      navigate({
        to: `../${previous.place_check_report_quantity_id}`,
        params: (prev) => ({
          ...prev,
          placeCheckReportQuantityId: previous.place_check_report_quantity_id,
        }),
      })
    } catch (error) {
      console.error(
        'Error navigating to previous place report quantity:',
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
      tableName="place report quantity"
    />
  )
}
