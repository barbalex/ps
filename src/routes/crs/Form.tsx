import { memo, useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { TextField } from '../../components/shared/TextField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { CheckboxField } from '../../components/shared/CheckboxField.tsx'
import { ComboboxFilteringOptions } from './Combobox/index.tsx'

import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

// this form is rendered from a parent or outlet
export const Component = memo(({ autoFocusRef }) => {
  const { crs_id, project_id } = useParams()

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.crs.liveUnique({ where: { crs_id } }),
  )

  const onChange = useCallback<InputProps['onChange']>(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.crs.update({
        where: { crs_id },
        data: { [name]: value },
      })
    },
    [db.crs, crs_id],
  )

  const { results: project } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )
  const onChangeMapPresentation = useCallback<InputProps['onChange']>(
    (e, data) => {
      db.projects.update({
        where: { project_id },
        data: { map_presentation_crs: data?.checked ? row?.code : null },
      })
    },
    [db.projects, project_id, row?.code],
  )

  if (!row) return <Loading />

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
        value={project?.map_presentation_crs === row.code}
        onChange={onChangeMapPresentation}
      />
    </>
  )
})
