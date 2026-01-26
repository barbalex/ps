import { useRef, useState } from 'react'
import { useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'

import { Header } from './Header.tsx'
import { ProjectForm } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'
import { NotFound } from '../../components/NotFound.tsx'
import type Projects from '../../models/public/Projects.ts'

import '../../form.css'

export const Project = ({ from }) => {
  const addOperation = useSetAtom(addOperationAtom)
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const { projectId } = useParams({ from })

  const [validations, setValidations] = useState({})

  const db = usePGlite()

  const res = useLiveQuery(`SELECT * FROM projects WHERE project_id = $1`, [
    projectId,
  ])
  const row: Projects | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(`UPDATE projects SET ${name} = $1 WHERE project_id = $2`, [
        value,
        projectId,
      ])
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
    // add task to update server and rollback PGlite in case of error
    // https://tanstack.com/db/latest/docs/collections/electric-collection?
    // TODO: use this everywhere
    addOperation({
      table: 'projects',
      rowIdName: 'project_id',
      rowId: projectId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        from={from}
      />
      <div
        className="form-container"
        role="tabpanel"
        aria-labelledby="form"
      >
        {!res ?
          <Loading />
        : row ?
          <ProjectForm
            onChange={onChange}
            validations={validations}
            row={row}
            from={from}
            autoFocusRef={autoFocusRef}
          />
        : <NotFound
            table="Project"
            id={projectId}
          />
        }
      </div>
    </div>
  )
}
