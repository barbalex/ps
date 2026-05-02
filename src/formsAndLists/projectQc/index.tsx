import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { ProjectQcForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type ProjectQcs from '../../models/public/ProjectQcs.ts'

import '../../form.css'

const from = '/data/projects/$projectId_/qcs/$projectQcId/'

export const ProjectQc = () => {
  const { projectQcId } = useParams({ from })
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const res = useLiveQuery(
    `SELECT * FROM project_qcs WHERE project_qc_id = $1`,
    [projectQcId],
  )
  const row: ProjectQcs | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row?.[name] === value) return

    try {
      await db.query(
        `UPDATE project_qcs SET ${name} = $1 WHERE project_qc_id = $2`,
        [value, projectQcId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }

    setValidations((prev) => {
      const { [name]: _, ...rest } = prev
      return rest
    })

    addOperation({
      table: 'project_qcs',
      rowIdName: 'project_qc_id',
      rowId: projectQcId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Qualitätskontrolle" id={projectQcId} />
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <Form
          onChange={onChange}
          validations={validations}
          row={row}
          autoFocusRef={autoFocusRef}
        />
      </div>
    </div>
  )
}
