import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { createPlaceReport } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider.tsx'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, place_id, place_id2, place_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createPlaceReport({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.place_reports.create({ data })
    navigate({
      pathname: `../${data.place_report_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    db,
    navigate,
    place_id,
    place_id2,
    project_id,
    searchParams,
  ])

  const deleteRow = useCallback(async () => {
    await db.place_reports.delete({ where: { place_report_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.place_reports, navigate, place_report_id, searchParams])

  const toNext = useCallback(async () => {
    const placeReports = await db.place_reports.findMany({
      where: {  place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = placeReports.length
    const index = placeReports.findIndex(
      (p) => p.place_report_id === place_report_id,
    )
    const next = placeReports[(index + 1) % len]
    navigate({
      pathname: `../${next.place_report_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.place_reports,
    navigate,
    place_id,
    place_id2,
    place_report_id,
    searchParams,
  ])

  const toPrevious = useCallback(async () => {
    const placeReports = await db.place_reports.findMany({
      where: {  place_id: place_id2 ?? place_id },
      orderBy: { label: 'asc' },
    })
    const len = placeReports.length
    const index = placeReports.findIndex(
      (p) => p.place_report_id === place_report_id,
    )
    const previous = placeReports[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.place_report_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.place_reports,
    navigate,
    place_id,
    place_id2,
    place_report_id,
    searchParams,
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
