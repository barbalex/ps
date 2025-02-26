import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPlaceReportValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { place_report_id, place_report_value_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createPlaceReportValue({ db, place_report_id })
    const placeReportValue = res?.rows?.[0]
    navigate({
      pathname: `../${placeReportValue.place_report_value_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, place_report_id, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(
      `DELETE FROM place_report_values WHERE place_report_value_id = $1`,
      [place_report_value_id],
    )
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, navigate, place_report_value_id, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT * FROM place_report_values WHERE place_report_id = $1 ORDER BY label ASC`,
      [place_report_id],
    )
    const placeReportValues = res?.rows
    const len = placeReportValues.length
    const index = placeReportValues.findIndex(
      (p) => p.place_report_value_id === place_report_value_id,
    )
    const next = placeReportValues[(index + 1) % len]
    navigate({
      pathname: `../${next.place_report_value_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, place_report_id, place_report_value_id, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT place_report_value_id FROM place_report_values WHERE place_report_id = $1 ORDER BY label ASC`,
      [place_report_id],
    )
    const placeReportValues = res?.rows
    const len = placeReportValues.length
    const index = placeReportValues.findIndex(
      (p) => p.place_report_value_id === place_report_value_id,
    )
    const previous = placeReportValues[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.place_report_value_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, place_report_id, place_report_value_id, searchParams])

  return (
    <FormHeader
      title="Place Report Value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="place report value"
    />
  )
})
