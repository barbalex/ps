import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ActionReports as ActionReport } from '../../../generated/client'
import { actionReport as createActionReportPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    action_id,
    action_report_id,
  } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.action_reports.liveUnique({ where: { action_report_id } }),
    [action_report_id],
  )

  const addRow = useCallback(async () => {
    const newActionReport = createActionReportPreset()
    await db.action_reports.create({
      data: {
        ...newActionReport,
        action_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions/${action_id}/reports/${newActionReport.action_report_id}`,
    )
  }, [
    action_id,
    db.action_reports,
    navigate,
    place_id,
    place_id2,
    project_id,
    subproject_id,
  ])

  const deleteRow = useCallback(async () => {
    await db.action_reports.delete({
      where: {
        action_report_id,
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions/${action_id}/reports`,
    )
  }, [
    action_id,
    action_report_id,
    db.action_reports,
    navigate,
    place_id,
    place_id2,
    project_id,
    subproject_id,
  ])

  const row: ActionReport = results

  // console.log('ActionReport', { row, results })

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.action_reports.update({
        where: { action_report_id },
        data: { [name]: value },
      })
    },
    [db.action_reports, action_report_id],
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
        name="action_report_id"
        value={row.action_report_id ?? ''}
      />
      <TextField
        label="Year"
        name="year"
        value={row.year ?? ''}
        type="number"
        onChange={onChange}
      />
      <Jsonb
        table="action_reports"
        idField="action_report_id"
        id={row.action_report_id}
        data={row.data ?? {}}
        autoFocus
      />
    </div>
  )
}
