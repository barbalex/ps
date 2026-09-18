import { useRef, useState } from 'react'
import { useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import type { InputOnChangeData } from '@fluentui/react-components'

import { Header } from './Header.tsx'
import { ProjectForm } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'
import { NotFound } from '../../components/NotFound.tsx'
import type Projects from '../../models/public/Projects.ts'

import '../../form.css'

export const Project = ({ from }: { from: string }) => {
  const addOperation = useSetAtom(addOperationAtom)
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const { projectId } = useParams({ strict: false })

  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const db = usePGlite()

  const res = useLiveQuery(`SELECT * FROM projects WHERE project_id = $1`, [
    projectId,
  ])
  const row = res?.rows?.[0] as Projects | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data?: InputOnChangeData,
  ) => {
    const { name, value } = getValueFromChange(e, data!)
    // only change if value has changed: maybe only focus entered and left
    if (row?.[name as keyof Projects] === value) return

    try {
      await db.query(`UPDATE projects SET ${name} = $1 WHERE project_id = $2`, [
        value,
        projectId,
      ])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: (error as Error).message },
      }))
      return
    }
    setValidations((prev) => {
       
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
            row={row as unknown as Record<string, unknown>}
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
