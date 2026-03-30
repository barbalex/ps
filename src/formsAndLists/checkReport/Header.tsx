import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createCheckReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { projectId, subprojectId, placeId, placeId2, checkReportId } =
    useParams({
      from,
    })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const db = usePGlite()

  // Keep a ref to the current checkReportId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const checkReportIdRef = useRef(checkReportId)
  useEffect(() => {
    checkReportIdRef.current = checkReportId
  }, [checkReportId])

  const combinedRes = useLiveQuery(
    `SELECT (SELECT COUNT(*) FROM check_reports WHERE place_id = $1) AS count
    FROM place_levels pl
    WHERE pl.project_id = $2 AND pl.level = $3`,
    [placeId2 ?? placeId, projectId, placeId2 ? 2 : 1],
  )
  const rowCount = combinedRes?.rows?.[0]?.count ?? 2

  const title = formatMessage({ id: 'bCSwTx', defaultMessage: 'Kontroll-Bericht' })
  const basePath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/check-reports/${checkReportId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/check-reports/${checkReportId}`

  const addRow = async () => {
    const id = await createCheckReport({
      projectId,
      placeId: placeId2 ?? placeId,
    })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({
        ...prev,
        checkReportId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM check_reports WHERE place_check_report_id = $1`,
        [checkReportId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      db.query(
        `DELETE FROM check_reports WHERE place_check_report_id = $1`,
        [checkReportId],
      )
      addOperation({
        table: 'check_reports',
        rowIdName: 'place_check_report_id',
        rowId: checkReportId,
        operation: 'delete',
        prev,
      })
      navigate({ to: `..` })
    } catch (error) {
      console.error(error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT place_check_report_id FROM check_reports WHERE place_id = $1 ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const placeReports = res?.rows
      const len = placeReports.length
      const index = placeReports.findIndex(
        (p) => p.place_check_report_id === checkReportIdRef.current,
      )
      const next = placeReports[(index + 1) % len]
      navigate({
        to: `../${next.place_check_report_id}`,
        params: (prev) => ({
          ...prev,
          checkReportId: next.place_check_report_id,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT place_check_report_id FROM check_reports WHERE place_id = $1 ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const placeReports = res?.rows
      const len = placeReports.length
      const index = placeReports.findIndex(
        (p) => p.place_check_report_id === checkReportIdRef.current,
      )
      const previous = placeReports[(index + len - 1) % len]
      navigate({
        to: `../${previous.place_check_report_id}`,
        params: (prev) => ({
          ...prev,
          checkReportId: previous.place_check_report_id,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      title={title}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="place report"
      siblings={
        <HistoryToggleButton
          historiesPath={`${basePath}/histories`}
          formPath={`${basePath}/report`}
          historyTable="check_reports_history"
          rowIdField="place_check_report_id"
          rowId={checkReportId}
        />
      }
    />
  )
}
