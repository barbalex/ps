import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPlaceReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef, from }) => {
  const isForm =
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId_/report' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/$placeReportId_/report/'
  const { projectId, placeId, placeId2, placeReportId } = useParams({
    from,
  })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createPlaceReport({
      db,
      projectId,
      placeId: placeId2 ?? placeId,
    })
    const placeReport = res?.rows?.[0]
    navigate({
      to:
        isForm ?
          `../../${placeReport.place_report_id}/report`
        : `../${placeReport.place_report_id}/report`,
      params: (prev) => ({
        ...prev,
        placeReportId: placeReport.place_report_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, db, isForm, navigate, placeId, placeId2, projectId])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM place_reports WHERE place_report_id = $1`, [
      placeReportId,
    ])
    navigate({ to: isForm ? `../..` : `..` })
  }, [db, isForm, navigate, placeReportId])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT place_report_id FROM place_reports WHERE place_id = $1 ORDER BY label`,
      [placeId2 ?? placeId],
    )
    const placeReports = res?.rows
    const len = placeReports.length
    const index = placeReports.findIndex(
      (p) => p.place_report_id === placeReportId,
    )
    const next = placeReports[(index + 1) % len]
    navigate({
      to:
        isForm ?
          `../../${next.place_report_id}/report`
        : `../${next.place_report_id}`,
      params: (prev) => ({ ...prev, placeReportId: next.place_report_id }),
    })
  }, [db, isForm, navigate, placeId, placeId2, placeReportId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT place_report_id FROM place_reports WHERE place_id = $1 ORDER BY label`,
      [placeId2 ?? placeId],
    )
    const placeReports = res?.rows
    const len = placeReports.length
    const index = placeReports.findIndex(
      (p) => p.place_report_id === placeReportId,
    )
    const previous = placeReports[(index + len - 1) % len]
    navigate({
      to:
        isForm ?
          `../../${previous.place_report_id}/report`
        : `../${previous.place_report_id}`,
      params: (prev) => ({
        ...prev,
        placeReportId: previous.place_report_id,
      }),
    })
  }, [db, isForm, navigate, placeId, placeId2, placeReportId])

  return (
    <FormHeader
      title="Place Report"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="place report"
    />
  )
})
