import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { SubprojectReports as SubprojectReport } from '../../../generated/client'
import { subprojectReport as createNewSubprojectReport } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { project_id, subproject_id, subproject_report_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.subproject_reports.liveUnique({ where: { subproject_report_id } }),
    [subproject_report_id],
  )

  const addRow = useCallback(async () => {
    const data = await createNewSubprojectReport({
      db,
      project_id,
      subproject_id,
    })
    await db.subproject_reports.create({ data })
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/reports/${data.subproject_report_id}`,
    )
  }, [db, navigate, project_id, subproject_id])

  const deleteRow = useCallback(async () => {
    await db.subproject_reports.delete({
      where: {
        subproject_report_id,
      },
    })
    navigate(`/projects/${project_id}/subprojects/${subproject_id}/reports`)
  }, [
    db.subproject_reports,
    navigate,
    project_id,
    subproject_id,
    subproject_report_id,
  ])

  const row: SubprojectReport = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.subproject_reports.update({
        where: { subproject_report_id },
        data: { [name]: value },
      })
    },
    [db.subproject_reports, subproject_report_id],
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
        name="subproject_report_id"
        value={row.subproject_report_id}
      />
      <TextField
        label="Year"
        name="year"
        type="number"
        value={row.year ?? ''}
        onChange={onChange}
      />
      <Jsonb
        table="subproject_reports"
        idField="subproject_report_id"
        id={row.subproject_report_id}
        data={row.data ?? {}}
        autoFocus
      />
    </div>
  )
}
