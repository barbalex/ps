import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { PlaceReportValues as PlaceReportValue } from '../../../generated/client'
import { placeReportValue as createNewPlaceReportValue } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DropdownField } from '../components/shared/DropdownField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

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

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () =>
      db.place_report_values.liveUnique({ where: { place_report_value_id } }),
    [place_report_value_id],
  )

  const addRow = useCallback(async () => {
    const newPlaceReportValue = createNewPlaceReportValue()
    await db.place_report_values.create({
      data: {
        ...newPlaceReportValue,
        place_report_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/reports/${place_report_id}/values/${
        newPlaceReportValue.place_report_value_id
      }`,
    )
  }, [
    db.place_report_values,
    navigate,
    place_id,
    place_id2,
    place_report_id,
    project_id,
    subproject_id,
  ])

  const deleteRow = useCallback(async () => {
    await db.place_report_values.delete({
      where: {
        place_report_value_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/reports/${place_report_id}/values`,
    )
  }, [
    db.place_report_values,
    navigate,
    place_id,
    place_id2,
    place_report_id,
    place_report_value_id,
    project_id,
    subproject_id,
  ])

  const row: PlaceReportValue = results

  const unitWhere = useMemo(() => ({ use_for_place_report_values: true }), [])

  // console.log('PlaceReportValue, row:', row)

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.place_report_values.update({
        where: { place_report_value_id },
        data: { [name]: value },
      })
    },
    [db.place_report_values, place_report_value_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        tableName="goal report value"
      />
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
  )
}
