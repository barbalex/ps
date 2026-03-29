import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createPlaceCheckReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { projectId, subprojectId, placeId, placeId2, placeCheckReportId } =
    useParams({
      from,
    })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const db = usePGlite()

  // Keep a ref to the current placeCheckReportId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const placeCheckReportIdRef = useRef(placeCheckReportId)
  useEffect(() => {
    placeCheckReportIdRef.current = placeCheckReportId
  }, [placeCheckReportId])

  const combinedRes = useLiveQuery(
    `SELECT (SELECT COUNT(*) FROM place_check_reports WHERE place_id = $1) AS count
    FROM place_levels pl
    WHERE pl.project_id = $2 AND pl.level = $3`,
    [placeId2 ?? placeId, projectId, placeId2 ? 2 : 1],
  )
  const rowCount = combinedRes?.rows?.[0]?.count ?? 2

  const title = formatMessage({ id: 'bCSwTx', defaultMessage: 'Kontroll-Bericht' })
  const basePath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/check-reports/${placeCheckReportId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/check-reports/${placeCheckReportId}`

  const addRow = async () => {
    const id = await createPlaceCheckReport({
      projectId,
      placeId: placeId2 ?? placeId,
    })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({
        ...prev,
        placeCheckReportId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM place_check_reports WHERE place_check_report_id = $1`,
        [placeCheckReportId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      db.query(
        `DELETE FROM place_check_reports WHERE place_check_report_id = $1`,
        [placeCheckReportId],
      )
      addOperation({
        table: 'place_check_reports',
        rowIdName: 'place_check_report_id',
        rowId: placeCheckReportId,
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
        `SELECT place_check_report_id FROM place_check_reports WHERE place_id = $1 ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const placeReports = res?.rows
      const len = placeReports.length
      const index = placeReports.findIndex(
        (p) => p.place_check_report_id === placeCheckReportIdRef.current,
      )
      const next = placeReports[(index + 1) % len]
      navigate({
        to: `../${next.place_check_report_id}`,
        params: (prev) => ({
          ...prev,
          placeCheckReportId: next.place_check_report_id,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT place_check_report_id FROM place_check_reports WHERE place_id = $1 ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const placeReports = res?.rows
      const len = placeReports.length
      const index = placeReports.findIndex(
        (p) => p.place_check_report_id === placeCheckReportIdRef.current,
      )
      const previous = placeReports[(index + len - 1) % len]
      navigate({
        to: `../${previous.place_check_report_id}`,
        params: (prev) => ({
          ...prev,
          placeCheckReportId: previous.place_check_report_id,
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
          historyTable="place_check_reports_history"
          rowIdField="place_check_report_id"
          rowId={placeCheckReportId}
        />
      }
    />
  )
}
