import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createPlaceReportValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = ({ autoFocusRef, from }) => {
  const { placeReportId, placeReportValueId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = async () => {
    const res = await createPlaceReportValue({ db, placeReportId })
    const placeReportValue = res?.rows?.[0]
    console.log('PlaceReportValue, addRow, placeReportValue:', placeReportValue)
    navigate({
      to: `../${placeReportValue.place_report_value_id}`,
      params: (prev) => ({
        ...prev,
        placeReportValueId: placeReportValue.place_report_value_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(
      `DELETE FROM place_report_values WHERE place_report_value_id = $1`,
      [placeReportValueId],
    )
    navigate({ to: '..' })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT place_report_value_id FROM place_report_values WHERE place_report_id = $1 ORDER BY label`,
      [placeReportId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex(
      (p) => p.place_report_value_id === placeReportValueId,
    )
    const next = rows[(index + 1) % len]
    navigate({
      to: `../${next.place_report_value_id}`,
      params: (prev) => ({
        ...prev,
        placeReportValueId: next.place_report_value_id,
      }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT place_report_value_id FROM place_report_values WHERE place_report_id = $1 ORDER BY label`,
      [placeReportId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex(
      (p) => p.place_report_value_id === placeReportValueId,
    )
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: `../${previous.place_report_value_id}`,
      params: (prev) => ({
        ...prev,
        placeReportValueId: previous.place_report_value_id,
      }),
    })
  }

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
}
