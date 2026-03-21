import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createCheckReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { formatMessage } = useIntl()
  const { projectId, checkId, checkReportId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const checkReportIdRef = useRef(checkReportId)
  useEffect(() => {
    checkReportIdRef.current = checkReportId
  }, [checkReportId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM check_reports WHERE check_id = '${checkId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createCheckReport({ projectId, checkId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, checkReportId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM check_reports WHERE check_report_id = $1`,
        [checkReportId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM check_reports WHERE check_report_id = $1`, [
        checkReportId,
      ])
      addOperation({
        table: 'check_reports',
        rowIdName: 'check_report_id',
        rowId: checkReportId,
        operation: 'delete',
        prev,
      })
      navigate({ to: `..` })
    } catch (error) {
      console.error('Error deleting check report:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT check_report_id FROM check_reports WHERE check_id = $1 ORDER BY label`,
        [checkId],
      )
      const checkReports = res?.rows
      const len = checkReports.length
      const index = checkReports.findIndex(
        (p) => p.check_report_id === checkReportIdRef.current,
      )
      const next = checkReports[(index + 1) % len]
      navigate({
        to: `../${next.check_report_id}`,
        params: (prev) => ({ ...prev, checkReportId: next.check_report_id }),
      })
    } catch (error) {
      console.error('Error navigating to next check report:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT check_report_id FROM check_reports WHERE check_id = $1 ORDER BY label`,
        [checkId],
      )
      const checkReports = res?.rows
      const len = checkReports.length
      const index = checkReports.findIndex(
        (p) => p.check_report_id === checkReportIdRef.current,
      )
      const previous = checkReports[(index + len - 1) % len]
      navigate({
        to: `../${previous.check_report_id}`,
        params: (prev) => ({
          ...prev,
          checkReportId: previous.check_report_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous check report:', error)
    }
  }

  return (
    <FormHeader
      title={formatMessage({
        id: 'Z8jucQ',
          defaultMessage: 'Bericht',
      })}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="check report"
    />
  )
}
