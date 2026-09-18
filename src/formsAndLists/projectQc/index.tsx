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


export const ProjectQc = () => {
  const { projectQcId } = useParams({ strict: false })
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const res = useLiveQuery(
    `SELECT * FROM project_qcs WHERE project_qc_id = $1`,
    [projectQcId],
  )
  const row = res?.rows?.[0] as ProjectQcs | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data: Parameters<typeof getValueFromChange>[1],
  ) => {
    const { name, value } = getValueFromChange(e, data)
    if ((row as Record<string, any>)?.[name] === value) return

    try {
      await db.query(
        `UPDATE project_qcs SET ${name} = $1 WHERE project_qc_id = $2`,
        [value, projectQcId],
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
