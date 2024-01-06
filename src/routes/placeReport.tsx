import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { PlaceReports as PlaceReport } from '../../../generated/client'
import { placeReport as createPlaceReportPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, place_id, place_id2, place_report_id } =
    useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.place_reports.liveUnique({ where: { place_report_id } }),
    [place_report_id],
  )

  const addRow = useCallback(async () => {
    const data = await createPlaceReportPreset({
      db,
      project_id,
      place_id: place_id2 ?? place_id,
    })
    await db.place_reports.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/reports/${data.place_report_id}`,
    )
  }, [db, navigate, place_id, place_id2, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.place_reports.delete({
      where: {
        place_report_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/reports`,
    )
  }, [
    db.place_reports,
    navigate,
    place_id,
    place_id2,
    place_report_id,
    project_id,
    subproject_id,
  ])

  const row: PlaceReport = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.place_reports.update({
        where: { place_report_id },
        data: { [name]: value },
      })
    },
    [db.place_reports, place_report_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        tableName="place report"
      />
      <TextFieldInactive
        label="ID"
        name="place_report_id"
        value={row.place_report_id}
      />
      <TextField
        label="Year"
        name="year"
        type="number"
        value={row.year ?? ''}
        onChange={onChange}
      />
      <Jsonb
        table="place_reports"
        idField="place_report_id"
        id={row.place_report_id}
        data={row.data ?? {}}
        autoFocus
      />
    </div>
  )
}
