import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { createPlaceActionReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { projectId, subprojectId, placeId, placeId2, placeActionReportId } =
    useParams({
      from,
    })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const db = usePGlite()

  const placeActionReportIdRef = useRef(placeActionReportId)
  useEffect(() => {
    placeActionReportIdRef.current = placeActionReportId
  }, [placeActionReportId])

  const combinedRes = useLiveQuery(
    `SELECT (SELECT COUNT(*) FROM place_action_reports WHERE place_id = $1) AS count
    FROM place_levels pl
    WHERE pl.project_id = $2 AND pl.level = $3`,
    [placeId2 ?? placeId, projectId, placeId2 ? 2 : 1],
  )
  const rowCount = combinedRes?.rows?.[0]?.count ?? 2

  const title = formatMessage({
    id: 'YMGqLf',
    defaultMessage: 'Massnahmen-Bericht',
  })
  const basePath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}/action-reports/${placeActionReportId}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/action-reports/${placeActionReportId}`

  const addRow = async () => {
    const id = await createPlaceActionReport({
      projectId,
      placeId: placeId2 ?? placeId,
    })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({
        ...prev,
        placeActionReportId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM place_action_reports WHERE place_action_report_id = $1`,
        [placeActionReportId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      db.query(
        `DELETE FROM place_action_reports WHERE place_action_report_id = $1`,
        [placeActionReportId],
      )
      addOperation({
        table: 'place_action_reports',
        rowIdName: 'place_action_report_id',
        rowId: placeActionReportId,
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
        `SELECT place_action_report_id FROM place_action_reports WHERE place_id = $1 ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const placeReports = res?.rows
      const len = placeReports.length
      const index = placeReports.findIndex(
        (p) => p.place_action_report_id === placeActionReportIdRef.current,
      )
      const next = placeReports[(index + 1) % len]
      navigate({
        to: `../${next.place_action_report_id}`,
        params: (prev) => ({
          ...prev,
          placeActionReportId: next.place_action_report_id,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT place_action_report_id FROM place_action_reports WHERE place_id = $1 ORDER BY label`,
        [placeId2 ?? placeId],
      )
      const placeReports = res?.rows
      const len = placeReports.length
      const index = placeReports.findIndex(
        (p) => p.place_action_report_id === placeActionReportIdRef.current,
      )
      const previous = placeReports[(index + len - 1) % len]
      navigate({
        to: `../${previous.place_action_report_id}`,
        params: (prev) => ({
          ...prev,
          placeActionReportId: previous.place_action_report_id,
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
      tableName="place action report"
      siblings={
        <HistoryToggleButton
          historiesPath={`${basePath}/histories`}
          formPath={`${basePath}/report`}
          historyTable="place_action_reports_history"
          rowIdField="place_action_report_id"
          rowId={placeActionReportId}
        />
      }
    />
  )
}
