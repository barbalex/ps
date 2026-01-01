import { useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { ProjectReportForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type ProjectReport from '../../models/public/ProjectReport.ts'

import '../../form.css'

const from = '/data/projects/$projectId_/reports/$projectReportId/'

export const ProjectReport = () => {
  const { projectReportId } = useParams({ from })
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const res = useLiveQuery(
    `SELECT * FROM project_reports WHERE project_report_id = $1`,
    [projectReportId],
  )
  const row: ProjectReport | undefined = res?.rows?.[0]

  const onChange = (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    db.query(
      `UPDATE project_reports SET ${name} = $1 WHERE project_report_id = $2`,
      [value, projectReportId],
    )
    addOperation({
      table: 'project_reports',
      rowIdName: 'project_report_id',
      rowId: projectReportId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Project Report" id={projectReportId} />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <Form onChange={onChange} row={row} autoFocusRef={autoFocusRef} />
      </div>
    </div>
  )
}
