import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { ProjectReports as ProjectReport } from '../../../generated/client'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { Jsonb } from '../../components/shared/Jsonb'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { FormHeaderComponent } from './FormHeader'

import '../../form.css'

export const Component = () => {
  const { project_report_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.project_reports.liveUnique({ where: { project_report_id } }),
  )

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
    <div className="form-outer-container">
      <FormHeaderComponent autoFocusRef={autoFocusRef} />
      <div className="form-container">
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
    </div>
  )
}
