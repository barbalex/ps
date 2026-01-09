import { useRef } from 'react'
import { useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'

import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'
import { NotFound } from '../../components/NotFound.tsx'
import type Projects from '../../models/public/Projects.ts'
import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'

import '../../form.css'

export const Project = ({ from }) => {
  const addOperation = useSetAtom(addOperationAtom)
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const { projectId } = useParams({ from })

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
      return console.error('error updating project', error)
    }
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

  if (!res) return <Loading />

  if (!row) {
    return (
      <NotFound
        table="Project"
        id={projectId}
      />
    )
  }

  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row)

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
        <TextField
          label="Name"
          name="name"
          value={row.name ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <Jsonb
          table="projects"
          idField="project_id"
          id={row.project_id}
          data={jsonbData}
          from={from}
        />
      </div>
    </div>
  )
}
