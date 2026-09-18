import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { ProjectReportForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type ProjectReports from '../../models/public/ProjectReports.ts'

import '../../form.css'

const from = '/data/projects/$projectId_/reports/$projectReportId/'

export const ProjectReport = () => {
  const { projectReportId } = useParams({ strict: false })
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const res = useLiveQuery(
    `SELECT * FROM project_reports WHERE project_report_id = $1`,
    [projectReportId],
  )
  const row = res?.rows?.[0] as ProjectReports | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data: Parameters<typeof getValueFromChange>[1],
  ) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if ((row as Record<string, any>)[name] === value) return

    try {
      await db.query(
        `UPDATE project_reports SET ${name} = $1 WHERE project_report_id = $2`,
        [value, projectReportId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error instanceof Error ? error.message : String(error) },
      }))
      return
    }
    setValidations((prev) => {
       
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'project_reports',
      rowIdName: 'project_report_id',
      rowId: projectReportId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} />
      <div className="form-container">
        {!res ? (
          <Loading />
        ) : row ? (
          <Form
            onChange={onChange}
            row={row}
            from={from}
            autoFocusRef={autoFocusRef}
            validations={validations}
          />
        ) : (
          <NotFound table="Project Report" id={projectReportId} />
        )}
      </div>
    </div>
  )
}
