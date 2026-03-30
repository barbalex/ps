import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createCheckReportQuantity } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const {
    projectId,
    subprojectId,
    placeId,
    placeId2,
    checkReportId,
    checkReportQuantityId,
  } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()
  const basePath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/check-reports/${checkReportId}/quantities/${checkReportQuantityId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/check-reports/${checkReportId}/quantities/${checkReportQuantityId}`

  const db = usePGlite()

  const checkReportQuantityIdRef = useRef(checkReportQuantityId)
  useEffect(() => {
    checkReportQuantityIdRef.current = checkReportQuantityId
  }, [checkReportQuantityId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM check_report_quantities WHERE place_check_report_id = '${checkReportId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createCheckReportQuantity({ checkReportId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, checkReportQuantityId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        'SELECT * FROM check_report_quantities WHERE place_check_report_quantity_id = $1',
        [checkReportQuantityId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(
        'DELETE FROM check_report_quantities WHERE place_check_report_quantity_id = $1',
        [checkReportQuantityId],
      )
      addOperation({
        table: 'check_report_quantities',
        rowIdName: 'place_check_report_quantity_id',
        rowId: checkReportQuantityId,
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
        'SELECT place_check_report_quantity_id FROM check_report_quantities WHERE place_check_report_id = $1 ORDER BY label',
        [checkReportId],
      )
      const quantities = res?.rows
      const len = quantities.length
      const index = quantities.findIndex(
        (p) => p.place_check_report_quantity_id === checkReportQuantityIdRef.current,
      )
      const next = quantities[(index + 1) % len]
      navigate({
        to: `../${next.place_check_report_quantity_id}`,
        params: (prev) => ({
          ...prev,
          checkReportQuantityId: next.place_check_report_quantity_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to next place report quantity:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        'SELECT place_check_report_quantity_id FROM check_report_quantities WHERE place_check_report_id = $1 ORDER BY label',
        [checkReportId],
      )
      const quantities = res?.rows
      const len = quantities.length
      const index = quantities.findIndex(
        (p) => p.place_check_report_quantity_id === checkReportQuantityIdRef.current,
      )
      const previous = quantities[(index + len - 1) % len]
      navigate({
        to: `../${previous.place_check_report_quantity_id}`,
        params: (prev) => ({
          ...prev,
          checkReportQuantityId: previous.place_check_report_quantity_id,
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
      siblings={
        <HistoryToggleButton
          historiesPath={`${basePath}/histories`}
          formPath={basePath}
          historyTable="check_report_quantities_history"
          rowIdField="place_check_report_quantity_id"
          rowId={checkReportQuantityId}
        />
      }
    />
  )
}
