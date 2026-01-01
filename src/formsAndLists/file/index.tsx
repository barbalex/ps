import { useParams } from '@tanstack/react-router'
import { useResizeDetector } from 'react-resize-detector'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { Header } from './Header.tsx'
import { Uploader } from './Uploader.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type Files from '../../models/public/Files.ts'

import '../../form.css'

// create type from Files with added file_id as id
type File = Files & { id: Files['file_id'] }

export const File = ({ from }) => {
  const { fileId } = useParams({ from })
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const res = useLiveQuery(
    `
    SELECT file_id as id, * 
    FROM files 
    WHERE file_id = $1`,
    [fileId],
  )
  const row: File | undefined = res?.rows?.[0]

  const onChange = (e, dataIn) => {
    const { name, value } = getValueFromChange(e, dataIn)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

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
      fileId,
      ...Object.values(data),
    ])
    addOperation({
      table: 'files',
      rowIdName: 'file_id',
      rowId: fileId,
      type: 'update',
      draft: { ...data },
      prev: { ...row },
    })
  }

  const { width, ref } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 300,
    refreshOptions: { leading: false, trailing: true },
  })

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="File" id={fileId} />
  }

  return (
    <div className="form-outer-container" ref={ref}>
      <Uploader from={from} />
      <Header from={from} />
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
          where={`project_id ${row?.project_id ? `= '${row.project_id}'` : 'IS NULL'}`}
          value={row.subproject_id ?? ''}
          onChange={onChange}
        />
        <DropdownField
          label="Place"
          name="place_id"
          table="places"
          where={`subproject_id ${row?.subproject_id ? `= '${row?.subproject_id}'` : 'IS NULL'}`}
          value={row.place_id ?? ''}
          onChange={onChange}
        />
        <DropdownField
          label="Action"
          name="action_id"
          table="actions"
          where={`place_id ${row?.place_id ? `= '${row.place_id}'` : 'IS NULL'}`}
          value={row.action_id ?? ''}
          onChange={onChange}
        />
        <DropdownField
          label="Check"
          name="check_id"
          table="checks"
          where={`place_id ${row?.place_id ? `= '${row.place_id}'` : 'IS NULL'}`}
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
          from={from}
        />
      </div>
    </div>
  )
}
