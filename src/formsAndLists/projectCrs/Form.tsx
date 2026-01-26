import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { CheckboxField } from '../../components/shared/CheckboxField.tsx'
import { ComboboxFilteringOptions } from './Combobox/index.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'

import type ProjectCrs from '../../models/public/ProjectCrs.ts'
import type Projects from '../../models/public/Projects.ts'

import '../../form.css'

// create type from ProjectCrs plus project_map_presentation_crs from Projects
type ProjectCrsWithPresentation = ProjectCrs & {
  project_map_presentation_crs: Projects['map_presentation_crs']
}

const from = '/data/projects/$projectId_/crs/$projectCrsId/'

// this form is rendered from a parent or outlet
export const ProjectCrsForm = ({ autoFocusRef }) => {
  const { projectCrsId, projectId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)

  const [validations, setValidations] = useState({})

  const db = usePGlite()
  const res = useLiveQuery(
    `
      SELECT 
        project_crs.*,
        projects.map_presentation_crs as project_map_presentation_crs
      FROM project_crs 
        inner join projects on projects.project_id = project_crs.project_id
      WHERE project_crs_id = $1`,
    [projectCrsId],
  )
  const row: ProjectCrsWithPresentation | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row?.[name] === value) return

    try {
      await db.query(
        `UPDATE project_crs SET ${name} = $1 WHERE project_crs_id = $2`,
        [value, projectCrsId],
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
      table: 'project_crs',
      rowIdName: 'project_crs_id',
      rowId: projectCrsId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const onChangeMapPresentation = async (e, data) => {
    const prevRes = await db.query(
      `SELECT * FROM projects WHERE project_id = $1`,
      [projectId],
    )
    const prev = prevRes.rows?.[0] ?? {}

    try {
      await db.query(
        `UPDATE projects SET map_presentation_crs = $1 WHERE project_id = $2`,
        [data?.checked ? row?.code : null, projectId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        map_presentation_crs: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { map_presentation_crs: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'projects',
      rowIdName: 'project_id',
      rowId: projectId,
      operation: 'update',
      draft: {
        map_presentation_crs: data?.checked ? row?.code : null,
      },
      prev,
    })
  }

  // console.log('ProjectCrsForm, row:', row)

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Project CRS" id={projectCrsId} />
  }

  return (
    <>
      <ComboboxFilteringOptions autoFocus={!row.code} ref={autoFocusRef} />
      <TextField
        label="Code"
        name="code"
        type="code"
        value={row.code ?? ''}
        onChange={onChange}
        validationState={validations?.code?.state}
        validationMessage={validations?.code?.message}
      />
      <TextField
        label="Name"
        name="name"
        type="name"
        value={row.name ?? ''}
        onChange={onChange}
        validationState={validations?.name?.state}
        validationMessage={validations?.name?.message}
      />
      <TextArea
        label="Proj4 Value"
        name="proj4"
        type="proj4"
        value={row.proj4 ?? ''}
        onChange={onChange}
        validationState={validations?.proj4?.state}
        validationMessage={validations?.proj4?.message}
      />
      <CheckboxField
        label="Set as Map Presentation CRS"
        name="map_presentation_crs"
        value={row.project_map_presentation_crs === row.code}
        onChange={onChangeMapPresentation}
        validationState={validations?.map_presentation_crs?.state}
        validationMessage={validations?.map_presentation_crs?.message}
      />
    </>
  )
}
