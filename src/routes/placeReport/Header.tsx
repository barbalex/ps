import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPlaceReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, place_id, place_id2, place_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createPlaceReport({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    const placeReport = res.rows?.[0]
    navigate({
      pathname: `../${placeReport.place_report_id}`,
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
    db.query(`DELETE FROM place_reports WHERE place_report_id = $1`, [
      place_report_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, navigate, place_report_id, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT place_report_id FROM place_reports WHERE place_id = $1 order by label asc`,
      [place_id2 ?? place_id],
    )
    const placeReports = res.rows
    const len = placeReports.length
    const index = placeReports.findIndex(
      (p) => p.place_report_id === place_report_id,
    )
    const next = placeReports[(index + 1) % len]
    navigate({
      pathname: `../${next.place_report_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, place_id, place_id2, place_report_id, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT place_report_id FROM place_reports WHERE place_id = $1 order by label asc`,
      [place_id2 ?? place_id],
    )
    const placeReports = res.rows
    const len = placeReports.length
    const index = placeReports.findIndex(
      (p) => p.place_report_id === place_report_id,
    )
    const previous = placeReports[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.place_report_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, place_id, place_id2, place_report_id, searchParams])

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
