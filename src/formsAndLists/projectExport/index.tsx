import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { ProjectExportForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'

import '../../form.css'

const from = '/data/projects/$projectId_/exports/$projectExportsId/'

export const ProjectExport = () => {
  const { projectExportsId } = useParams({ from })
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const res = useLiveQuery(
    `SELECT * FROM project_exports WHERE project_exports_id = $1`,
    [projectExportsId],
  )
  const row = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row?.[name] === value) return

    try {
      await db.query(
        `UPDATE project_exports SET ${name} = $1 WHERE project_exports_id = $2`,
        [value, projectExportsId],
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
      table: 'project_exports',
      rowIdName: 'project_exports_id',
      rowId: projectExportsId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Export" id={projectExportsId} />
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
