import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ProjectReports as ProjectReport } from '../../../generated/client'
import { projectReport as createProjectReportPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, project_report_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.project_reports.liveUnique({ where: { project_report_id } }),
    [project_report_id],
  )

  const addRow = useCallback(async () => {
    const newProjectReport = createProjectReportPreset()
    await db.project_reports.create({
      data: { ...newProjectReport, project_id },
    })
    navigate(
      `/projects/${project_id}/reports/${newProjectReport.project_report_id}`,
    )
  }, [db.project_reports, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.project_reports.delete({
      where: {
        project_report_id,
      },
    })
    navigate(`/projects/${project_id}/reports`)
  }, [db.project_reports, navigate, project_id, project_report_id])

  const row: ProjectReport = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.project_reports.update({
        where: { project_report_id },
        data: { [name]: value },
      })
    },
    [db.project_reports, project_report_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        tableName="project report"
      />
      <TextFieldInactive
        label="ID"
        name="project_report_id"
        value={row.project_report_id}
      />
      <TextField
        label="Year"
        name="year"
        type="number"
        value={row.year ?? ''}
        onChange={onChange}
      />
      <Jsonb
        table="project_reports"
        idField="project_report_id"
        id={row.project_report_id}
        data={row.data ?? {}}
        autoFocus
      />
    </div>
  )
}
