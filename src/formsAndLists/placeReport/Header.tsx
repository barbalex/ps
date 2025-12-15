import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createPlaceReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const isForm =
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/reports/$placeReportId_/report' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/reports/$placeReportId_/report/'
  const { projectId, placeId, placeId2, placeReportId } = useParams({
    from,
  })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const id = await createPlaceReport({
      db,
      projectId,
      placeId: placeId2 ?? placeId,
    })
    if (!id) return
    navigate({
      to: isForm ? `../../${id}/report` : `../${id}/report`,
      params: (prev) => ({
        ...prev,
        placeReportId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(
      `SELECT * FROM place_reports WHERE place_report_id = $1`,
      [placeReportId],
    )
    const prev = prevRes?.rows?.[0] ?? {}
    db.query(`DELETE FROM place_reports WHERE place_report_id = $1`, [
      placeReportId,
    ])
    addOperation({
      table: 'place_reports',
      rowIdName: 'place_report_id',
      rowId: placeReportId,
      operation: 'delete',
      prev,
    })
    navigate({ to: isForm ? `../..` : `..` })
  }

  const toNext = async () => {
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
  }

  const toPrevious = async () => {
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
  }

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
}
