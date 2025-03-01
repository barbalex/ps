import { memo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { CheckboxField } from '../../components/shared/CheckboxField.tsx'
import { ComboboxFilteringOptions } from './Combobox/index.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'

import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

// this form is rendered from a parent or outlet
export const Component = memo(({ autoFocusRef }) => {
  const { project_crs_id, project_id } = useParams()

  const db = usePGlite()
  const resProjectCrs = useLiveIncrementalQuery(
    `SELECT * FROM project_crs WHERE project_crs_id = $1`,
    [project_crs_id],
    'project_crs_id',
  )
  const row = resProjectCrs?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.query(
        `UPDATE project_crs SET ${name} = $1 WHERE project_crs_id = $2`,
        [value, project_crs_id],
      )
    },
    [db, project_crs_id],
  )

  const resProject = useLiveIncrementalQuery(
    `SELECT project_id, map_presentation_crs FROM projects WHERE project_id = $1`,
    [project_id],
    'project_id',
  )
  const project = resProject?.rows?.[0]
  const onChangeMapPresentation = useCallback<InputProps['onChange']>(
    (e, data) => {
      db.query(
        `UPDATE projects SET map_presentation_crs = $1 WHERE project_id = $2`,
        [data?.checked ? row?.code : null, project_id],
      )
    },
    [db, project_id, row?.code],
  )

  if (!row) return <Loading />

  return (
    <>
      <ComboboxFilteringOptions
        autoFocus={!row.code}
        ref={autoFocusRef}
      />
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
        value={project?.map_presentation_crs === row.code}
        onChange={onChangeMapPresentation}
      />
    </>
  )
})
