import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Files as File } from '../../../generated/client'
import { createFile } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { Jsonb } from '../components/shared/Jsonb'
import { getValueFromChange } from '../modules/getValueFromChange'
import { DropdownField } from '../components/shared/DropdownField'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { file_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.files.liveUnique({ where: { file_id } }),
    [file_id],
  )

  const addRow = useCallback(async () => {
    const data = await createFile({ db })
    await db.files.create({ data })
    navigate(`/files/${data.file_id}`)
  }, [db, navigate])

  const deleteRow = useCallback(async () => {
    await db.files.delete({
      where: {
        file_id,
      },
    })
    navigate(`/files`)
  }, [file_id, db.files, navigate])

  const row: File = results

  const onChange = useCallback(
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

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        tableName="goal report value"
      />
      <TextFieldInactive label="ID" name="file_id" value={row.file_id ?? ''} />
      <DropdownField
        label="Project"
        name="project_id"
        table="projects"
        value={row.project_id ?? ''}
        onChange={onChange}
      />
      {!!row?.project_id && (
        <DropdownField
          label="Subproject"
          name="subproject_id"
          table="subprojects"
          where={subprojectWhere}
          value={row.subproject_id ?? ''}
          onChange={onChange}
        />
      )}
      {!!row?.subproject_id && (
        <DropdownField
          label="Place"
          name="place_id"
          table="places"
          where={placeWhere}
          value={row.place_id ?? ''}
          onChange={onChange}
        />
      )}
      {!!row?.place_id && (
        <DropdownField
          label="Action"
          name="action_id"
          table="actions"
          where={actionWhere}
          value={row.action_id ?? ''}
          onChange={onChange}
        />
      )}
      {!!row.place_id && (
        <DropdownField
          label="Check"
          name="check_id"
          table="checks"
          where={actionWhere}
          value={row.check_id ?? ''}
          onChange={onChange}
        />
      )}
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Mimetype"
        name="mimetype"
        value={row.mimetype ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Url"
        name="url"
        type="url"
        value={row.url ?? ''}
        onChange={onChange}
      />
      <Jsonb
        table="files"
        idField="file_id"
        id={row.file_id}
        data={row.data ?? {}}
      />
    </div>
  )
}
