import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { Header } from './Header.tsx'
import { SubprojectForm as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'

import type Subprojects from '../../models/public/Subprojects.ts'
import type Projects from '../../models/public/Projects.ts'

import '../../form.css'

// create type combining Subprojects and project subproject_name_singular from Projects
type SubprojectWithProjectInfo = Subprojects & {
  subproject_name_singular: Projects['subproject_name_singular']
}

export const Subproject = ({ from }) => {
  const { subprojectId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT 
      subprojects.*, 
      projects.subproject_name_singular 
    FROM 
      subprojects 
        inner join projects on projects.project_id = subprojects.project_id 
    WHERE subproject_id = $1`,
    [subprojectId],
  )
  const row: SubprojectWithProjectInfo | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE subprojects SET ${name} = $1 WHERE subproject_id = $2`,
        [value, subprojectId],
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
      table: 'subprojects',
      rowIdName: 'subproject_id',
      rowId: subprojectId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        nameSingular={row?.subproject_name_singular}
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
          <Form
            onChange={onChange}
            row={row}
            autoFocusRef={autoFocusRef}
            from={from}
            validations={validations}
          />
        : <NotFound
            table="Subproject"
            id={subprojectId}
          />
        }
      </div>
    </div>
  )
}
