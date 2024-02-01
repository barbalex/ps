import { useCallback, memo, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createPlaceReport } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id, place_id, place_id2, place_report_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/reports`,
    [place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const data = await createPlaceReport({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.place_reports.create({ data })
    navigate(`${baseUrl}/${data.place_report_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db, navigate, place_id, place_id2, project_id])

  const deleteRow = useCallback(async () => {
    await db.place_reports.delete({
      where: {
        place_report_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, db.place_reports, navigate, place_report_id])

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
    navigate(`${baseUrl}/${next.place_report_id}`)
  }, [
    baseUrl,
    db.place_reports,
    navigate,
    place_id,
    place_id2,
    place_report_id,
  ])

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
    navigate(`${baseUrl}/${previous.place_report_id}`)
  }, [
    baseUrl,
    db.place_reports,
    navigate,
    place_id,
    place_id2,
    place_report_id,
  ])

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
