import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { createPlaceReportValue } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'

export const Header = memo(({ autoFocusRef }) => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    place_report_id,
    place_report_value_id,
  } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
    place_id2 ? `/places/${place_id2}` : ''
  }/reports/${place_report_id}/values`

  const addRow = useCallback(async () => {
    const placeReportValue = createPlaceReportValue()
    await db.place_report_values.create({
      data: {
        ...placeReportValue,
        place_report_id,
      },
    })
    navigate(`${baseUrl}/${placeReportValue.place_report_value_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, baseUrl, db.place_report_values, navigate, place_report_id])

  const deleteRow = useCallback(async () => {
    await db.place_report_values.delete({
      where: {
        place_report_value_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, db.place_report_values, navigate, place_report_value_id])

  const toNext = useCallback(async () => {
    const placeReportValues = await db.place_report_values.findMany({
      where: { deleted: false, place_report_id },
      orderBy: { label: 'asc' },
    })
    const len = placeReportValues.length
    const index = placeReportValues.findIndex(
      (p) => p.place_report_value_id === place_report_value_id,
    )
    const next = placeReportValues[(index + 1) % len]
    navigate(`${baseUrl}/${next.place_report_value_id}`)
  }, [
    baseUrl,
    db.place_report_values,
    navigate,
    place_report_id,
    place_report_value_id,
  ])

  const toPrevious = useCallback(async () => {
    const placeReportValues = await db.place_report_values.findMany({
      where: { deleted: false, place_report_id },
      orderBy: { label: 'asc' },
    })
    const len = placeReportValues.length
    const index = placeReportValues.findIndex(
      (p) => p.place_report_value_id === place_report_value_id,
    )
    const previous = placeReportValues[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.place_report_value_id}`)
  }, [
    baseUrl,
    db.place_report_values,
    navigate,
    place_report_id,
    place_report_value_id,
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
