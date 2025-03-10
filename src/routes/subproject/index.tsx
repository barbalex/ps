import { useRef, memo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { Header } from './Header.tsx'
import { Component as Form } from './Form.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'

import '../../form.css'

export const Component = memo(() => {
  const { subproject_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT 
      subprojects.*, 
      projects.subproject_name_singular 
    FROM 
      subprojects 
        inner join projects on projects.project_id = subprojects.project_id 
    WHERE subproject_id = $1`,
    [subproject_id],
    'subproject_id',
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      db.query(`UPDATE subprojects SET ${name} = $1 WHERE subproject_id = $2`, [
        value,
        subproject_id,
      ])
    },
    [db, row, subproject_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        nameSingular={row.subproject_name_singular}
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
        />
      </div>
    </div>
  )
})
