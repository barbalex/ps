import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { SubprojectReportForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type SubprojectReports from '../../models/public/SubprojectReports.ts'

import '../../form.css'

export const SubprojectReport = ({ from }: { from: string }) => {
  const { subprojectReportId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM subproject_reports WHERE subproject_report_id = $1`,
    [subprojectReportId],
  )
  const row = res?.rows?.[0] as SubprojectReports | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data: Parameters<typeof getValueFromChange>[1],
  ) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if ((row as Record<string, any>)[name] === value) return

    try {
      await db.query(
        `UPDATE subproject_reports SET ${name} = $1 WHERE subproject_report_id = $2`,
        [value, subprojectReportId],
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
      table: 'subproject_reports',
      rowIdName: 'subproject_report_id',
      rowId: subprojectReportId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Report" id={subprojectReportId} />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} />
      <div className="form-container">
        <Form
          onChange={onChange}
          row={row}
          autoFocusRef={autoFocusRef}
          from={from}
          validations={validations}
        />
      </div>
    </div>
  )
}
