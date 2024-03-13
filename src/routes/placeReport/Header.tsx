import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createPlaceReport } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, place_id, place_id2, place_report_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createPlaceReport({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.place_reports.create({ data })
    navigate(`../${data.place_report_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, place_id, place_id2, project_id])

  const deleteRow = useCallback(async () => {
    await db.place_reports.delete({ where: { place_report_id } })
    navigate('..')
  }, [db.place_reports, navigate, place_report_id])

  const toNext = useCallback(async () => {
    const placeReports = await db.place_reports.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = placeReports.length
    const index = placeReports.findIndex(
      (p) => p.place_report_id === place_report_id,
    )
    const next = placeReports[(index + 1) % len]
    navigate(`../${next.place_report_id}`)
  }, [db.place_reports, navigate, place_id, place_id2, place_report_id])

  const toPrevious = useCallback(async () => {
    const placeReports = await db.place_reports.findMany({
      where: { deleted: false, place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = placeReports.length
    const index = placeReports.findIndex(
      (p) => p.place_report_id === place_report_id,
    )
    const previous = placeReports[(index + len - 1) % len]
    navigate(`../${previous.place_report_id}`)
  }, [db.place_reports, navigate, place_id, place_id2, place_report_id])

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
