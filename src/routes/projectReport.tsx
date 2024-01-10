import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ProjectReports as ProjectReport } from '../../../generated/client'
import { createProjectReport } from '../modules/createRows'
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

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.project_reports.liveUnique({ where: { project_report_id } }),
    [project_report_id],
  )

  const baseUrl = `/projects/${project_id}/reports`

  const addRow = useCallback(async () => {
    const data = await createProjectReport({ db, project_id })
    await db.project_reports.create({ data })
    navigate(`${baseUrl}/${data.project_report_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db, navigate, project_id])

  const deleteRow = useCallback(async () => {
    await db.project_reports.delete({
      where: { project_report_id },
    })
    navigate(baseUrl)
  }, [baseUrl, db.project_reports, navigate, project_report_id])

  const toNext = useCallback(async () => {
    const projectReports = await db.project_reports.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = projectReports.length
    const index = projectReports.findIndex(
      (p) => p.project_report_id === project_report_id,
    )
    const next = projectReports[(index + 1) % len]
    navigate(`${baseUrl}/${next.project_report_id}`)
  }, [baseUrl, db.project_reports, navigate, project_id, project_report_id])

  const toPrevious = useCallback(async () => {
    const projectReports = await db.project_reports.findMany({
      where: { deleted: false, project_id },
      orderBy: { label: 'asc' },
    })
    const len = projectReports.length
    const index = projectReports.findIndex(
      (p) => p.project_report_id === project_report_id,
    )
    const previous = projectReports[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.project_report_id}`)
  }, [baseUrl, db.project_reports, navigate, project_id, project_report_id])

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
        toNext={toNext}
        toPrevious={toPrevious}
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
        ref={autoFocusRef}
      />
    </div>
  )
}
