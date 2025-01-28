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
    const placeReportValue = createPlaceReportValue()
    await db.place_report_values.create({
      data: {
        ...placeReportValue,
        place_report_id,
      },
    })
    navigate({
      pathname: `../${placeReportValue.place_report_value_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [
    autoFocusRef,
    db.place_report_values,
    navigate,
    place_report_id,
    searchParams,
  ])

  const deleteRow = useCallback(async () => {
    await db.place_report_values.delete({ where: { place_report_value_id } })
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db.place_report_values, navigate, place_report_value_id, searchParams])

  const toNext = useCallback(async () => {
    const placeReportValues = await db.place_report_values.findMany({
      where: { place_report_id },
      orderBy: { label: 'asc' },
    })
    const len = placeReportValues.length
    const index = placeReportValues.findIndex(
      (p) => p.place_report_value_id === place_report_value_id,
    )
    const next = placeReportValues[(index + 1) % len]
    navigate({
      pathname: `../${next.place_report_value_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.place_report_values,
    navigate,
    place_report_id,
    place_report_value_id,
    searchParams,
  ])

  const toPrevious = useCallback(async () => {
    const placeReportValues = await db.place_report_values.findMany({
      where: { place_report_id },
      orderBy: { label: 'asc' },
    })
    const len = placeReportValues.length
    const index = placeReportValues.findIndex(
      (p) => p.place_report_value_id === place_report_value_id,
    )
    const previous = placeReportValues[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.place_report_value_id}`,
      search: searchParams.toString(),
    })
  }, [
    db.place_report_values,
    navigate,
    place_report_id,
    place_report_value_id,
    searchParams,
  ])

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
