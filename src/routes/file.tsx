import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Files as File } from '../../../generated/client'
import { file as createFilePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
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
    const newFile = createFilePreset()
    await db.files.create({
      data: newFile,
    })
    navigate(`/files/${newFile.file_id}`)
  }, [db.files, navigate])

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
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.files.update({
        where: { file_id },
        data: { [name]: value },
      })
    },
    [db.files, file_id],
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
      <DropdownField
        label="Subproject"
        name="subproject_id"
        table="subprojects"
        value={row.subproject_id ?? ''}
        onChange={onChange}
      />
      <DropdownField
        label="Place"
        name="place_id"
        table="places"
        value={row.place_id ?? ''}
        onChange={onChange}
      />
      <DropdownField
        label="Action"
        name="action_id"
        table="actions"
        value={row.action_id ?? ''}
        onChange={onChange}
      />
      <DropdownField
        label="Check"
        name="check_id"
        table="checks"
        value={row.check_id ?? ''}
        onChange={onChange}
      />
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
    </div>
  )
}
