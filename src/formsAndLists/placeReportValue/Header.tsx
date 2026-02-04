import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createPlaceReportValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { placeReportId, placeReportValueId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM place_report_values WHERE place_report_id = '${placeReportId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createPlaceReportValue({ placeReportId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({
        ...prev,
        placeReportValueId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM place_report_values WHERE place_report_value_id = $1`,
        [placeReportValueId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      db.query(
        `DELETE FROM place_report_values WHERE place_report_value_id = $1`,
        [placeReportValueId],
      )
      addOperation({
        table: 'place_report_values',
        rowIdName: 'place_report_value_id',
        rowId: placeReportValueId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error(error)
    }
  }

  const toNext = async () => {
    try {
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
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
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
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      title="Place Report Value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="place report value"
    />
  )
}
