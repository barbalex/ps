import { useCallback, memo } from 'react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'
import { useResizeDetector } from 'react-resize-detector'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { Header } from './Header.tsx'
import { Uploader } from './Uploader.tsx'
import { Loading } from '../../components/shared/Loading.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { file_id } = useParams()
  const db = usePGlite()

  const result = useLiveQuery(`SELECT * FROM files WHERE file_id = $1`, [
    file_id,
  ])
  const row = result?.rows?.[0]

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
      let setsString = ''
      Object.keys(data).map(
        (key, i) =>
          (setsString += `${key} = $${i + 2}${
            i === Object.keys(data).length - 1 ? '' : ', '
          }`),
      )
      db.query(`UPDATE files SET ${setsString} WHERE file_id = $1`, [
        file_id,
        ...Object.values(data),
      ])
    },
    [db, file_id],
  )

  const { width, ref } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { leading: false, trailing: true },
  })

  if (!row) return <Loading />

  return (
    <div
      className="form-outer-container"
      ref={ref}
    >
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
          where={`project_id = '${row?.project_id}'`}
          value={row.subproject_id ?? ''}
          onChange={onChange}
        />
        <DropdownField
          label="Place"
          name="place_id"
          table="places"
          where={`subproject_id = '${row?.subproject_id}'`}
          value={row.place_id ?? ''}
          onChange={onChange}
        />
        <DropdownField
          label="Action"
          name="action_id"
          table="actions"
          where={`place_id = '${row?.place_id}'`}
          value={row.action_id ?? ''}
          onChange={onChange}
        />
        <DropdownField
          label="Check"
          name="check_id"
          table="checks"
          where={`place_id = '${row?.place_id}'`}
          value={row.check_id ?? ''}
          onChange={onChange}
        />
        <TextFieldInactive
          label="Name"
          name="name"
          value={row.name ?? ''}
        />
        <TextFieldInactive
          label="Size"
          name="size"
          value={row.size ?? ''}
        />
        <TextFieldInactive
          label="Mimetype"
          name="mimetype"
          value={row.mimetype ?? ''}
        />
        <TextFieldInactive
          label="Url"
          name="url"
          value={row.url ?? ''}
        />
        <TextFieldInactive
          label="Uuid"
          name="uuid"
          value={row.uuid ?? ''}
        />
        <Jsonb
          table="files"
          idField="file_id"
          id={row.file_id}
          data={row.data ?? {}}
        />
      </div>
    </div>
  )
})
