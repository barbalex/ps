import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { useResizeDetector } from 'react-resize-detector'

import { useElectric } from '../../ElectricProvider.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { Header } from './Header.tsx'
import { Uploader } from './Uploader.tsx'
import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

export const Component = () => {
  const { file_id } = useParams()

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.files.liveUnique({ where: { file_id } }),
  )

  const onChange = useCallback<InputProps['onChange']>(
    (e, dataIn) => {
      const { name, value } = getValueFromChange(e, dataIn)
      const data = { [name]: value }
      // if higher level is changed, lower levels need to be removed
      if (name === 'project_id') {
        data.subproject_id = null
        data.place_id = null
        data.action_id = null
        data.check_id = null
      }
      if (name === 'subproject_id') {
        data.place_id = null
        data.action_id = null
        data.check_id = null
      }
      if (name === 'place_id') {
        data.action_id = null
        data.check_id = null
      }
      db.files.update({
        where: { file_id },
        data,
      })
    },
    [db.files, file_id],
  )

  const subprojectWhere = useMemo(
    () => ({
      project_id: row?.project_id,
    }),
    [row?.project_id],
  )
  const placeWhere = useMemo(
    () => ({
      subproject_id: row?.subproject_id,
    }),
    [row?.subproject_id],
  )
  const actionWhere = useMemo(
    () => ({
      place_id: row?.place_id,
    }),
    [row?.place_id],
  )
  const { width, ref } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { leading: false, trailing: true },
  })

  if (!row) return <Loading />

  return (
    <div className="form-outer-container" ref={ref}>
      <Uploader />
      <Header />
      <div className="form-container">
        {(row.mimetype.includes('image') || row.mimetype.includes('pdf')) &&
          row.url &&
          width && (
            <img
              src={`${row.url}-/resize/${Math.floor(
                width,
              )}x/-/format/auto/-/quality/smart/`}
              alt={row.name}
            />
          )}
        <TextFieldInactive
          label="ID"
          name="file_id"
          value={row.file_id ?? ''}
        />
        {/* TODO: remove all id fields from form after implementing files everywhere */}
        <DropdownField
          label="Project"
          name="project_id"
          table="projects"
          value={row.project_id ?? ''}
          onChange={onChange}
        />
        <DropdownField
          label="Subproject"
          name="subproject_id"
          table="subprojects"
          where={subprojectWhere}
          value={row.subproject_id ?? ''}
          onChange={onChange}
        />
        <DropdownField
          label="Place"
          name="place_id"
          table="places"
          where={placeWhere}
          value={row.place_id ?? ''}
          onChange={onChange}
        />
        <DropdownField
          label="Action"
          name="action_id"
          table="actions"
          where={actionWhere}
          value={row.action_id ?? ''}
          onChange={onChange}
        />
        <DropdownField
          label="Check"
          name="check_id"
          table="checks"
          where={actionWhere}
          value={row.check_id ?? ''}
          onChange={onChange}
        />
        <TextFieldInactive label="Name" name="name" value={row.name ?? ''} />
        <TextFieldInactive label="Size" name="size" value={row.size ?? ''} />
        <TextFieldInactive
          label="Mimetype"
          name="mimetype"
          value={row.mimetype ?? ''}
        />
        <TextFieldInactive label="Url" name="url" value={row.url ?? ''} />
        <TextFieldInactive label="Uuid" name="uuid" value={row.uuid ?? ''} />
        <Jsonb
          table="files"
          idField="file_id"
          id={row.file_id}
          data={row.data ?? {}}
        />
      </div>
    </div>
  )
}
