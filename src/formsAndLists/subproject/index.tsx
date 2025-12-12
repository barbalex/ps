import { useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { Header } from './Header.tsx'
import { SubprojectForm as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { NotFound } from '../../components/NotFound.tsx'

import '../../form.css'

export const Subproject = ({ from }) => {
  const { subprojectId } = useParams({ from })
  console.log('Subproject, id:', subprojectId)

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
  const row = res?.rows?.[0]

  const onChange = (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    db.query(`UPDATE subprojects SET ${name} = $1 WHERE subproject_id = $2`, [
      value,
      subprojectId,
    ])
  }

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Subproject"
        id={subprojectId}
      />
    )
  }

  console.log('Subproject, row:', row)

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        nameSingular={row.subproject_name_singular}
        from={from}
      />
      <div
        className="form-container"
        role="tabpanel"
        aria-labelledby="form"
      >
        <Form
          onChange={onChange}
          row={row}
          autoFocusRef={autoFocusRef}
          from={from}
        />
      </div>
    </div>
  )
}
