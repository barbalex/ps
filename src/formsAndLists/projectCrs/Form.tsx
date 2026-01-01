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

import '../../form.css'

const from = '/data/projects/$projectId_/crs/$projectCrsId/'

// this form is rendered from a parent or outlet
export const ProjectCrsForm = ({ autoFocusRef }) => {
  const { projectCrsId, projectId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)

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
  const row: ProjectCrs | undefined = res?.rows?.[0]

  const onChange = (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row?.[name] === value) return

    db.query(`UPDATE project_crs SET ${name} = $1 WHERE project_crs_id = $2`, [
      value,
      projectCrsId,
    ])
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
    await db.query(
      `UPDATE projects SET map_presentation_crs = $1 WHERE project_id = $2`,
      [data?.checked ? row?.code : null, projectId],
    )
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
      />
      <TextField
        label="Name"
        name="name"
        type="name"
        value={row.name ?? ''}
        onChange={onChange}
      />
      <TextArea
        label="Proj4 Value"
        name="proj4"
        type="proj4"
        value={row.proj4 ?? ''}
        onChange={onChange}
      />
      <CheckboxField
        label="Set as Map Presentation CRS"
        name="map_presentation_crs"
        value={row.project_map_presentation_crs === row.code}
        onChange={onChangeMapPresentation}
      />
    </>
  )
}
