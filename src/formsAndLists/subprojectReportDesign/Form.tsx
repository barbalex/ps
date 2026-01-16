import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'

import type SubprojectReportDesigns from '../../models/public/SubprojectReportDesigns.ts'

export const Form = ({ autoFocusRef, from }) => {
  const { subprojectReportDesignId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM subproject_report_designs WHERE subproject_report_design_id = $1`,
    [subprojectReportDesignId],
  )
  const row: SubprojectReportDesigns | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE subproject_report_designs SET ${name} = $1 WHERE subproject_report_design_id = $2`,
        [value, subprojectReportDesignId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'subproject_report_designs',
      rowIdName: 'subproject_report_design_id',
      rowId: row.subproject_report_design_id,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Subproject Report Design"
        id={subprojectReportDesignId}
      />
    )
  }

  return (
    <div className="form-container">
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations.name?.state}
        validationMessage={validations.name?.message}
      />
      <div>TODO: add design tool</div>
    </div>
  )
}
