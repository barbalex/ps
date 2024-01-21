import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { PlaceReportValues as PlaceReportValue } from '../../../generated/client'
import { createPlaceReportValue } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DropdownField } from '../components/shared/DropdownField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    place_report_id,
    place_report_value_id,
  } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.place_report_values.liveUnique({ where: { place_report_value_id } }),
    [place_report_value_id],
  )

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/reports/${place_report_id}/values`,
    [place_id, place_id2, place_report_id, project_id, subproject_id],
  )

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
  }, [baseUrl, db.place_report_values, navigate, place_report_id])

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

  const row: PlaceReportValue = results

  const unitWhere = useMemo(() => ({ use_for_place_report_values: true }), [])

  // console.log('PlaceReportValue, row:', row)

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.place_report_values.update({
        where: { place_report_value_id },
        data: {
          [name]:
            isNaN(value) && ['value_integer', 'value_numeric'].includes(name)
              ? null
              : value,
        },
      })
    },
    [db.place_report_values, place_report_value_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <FormHeader
        title="Place Report Value"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="place report value"
      />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="place_report_value_id"
          value={row.place_report_value_id ?? ''}
        />
        <DropdownField
          label="Unit"
          name="unit_id"
          table="units"
          where={unitWhere}
          value={row.unit_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="Value (integer)"
          name="value_integer"
          type="number"
          value={row.value_integer ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Value (numeric)"
          name="value_numeric"
          type="number"
          value={row.value_numeric ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Value (text)"
          name="value_text"
          value={row.value_text ?? ''}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
