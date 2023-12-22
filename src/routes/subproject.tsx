import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { Button, Switch } from '@fluentui/react-components'

import { Subprojects as Subproject } from '../../../generated/client'
import { subproject as createSubprojectPreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'

import '../form.css'


export const Component = () => {
  const { project_id, subproject_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.subprojects.liveUnique({ where: { subproject_id } }),
  )

  const addRow = async () => {
    const newSubproject = createSubprojectPreset()
    await db.subprojects.create({
      data: {
        ...newSubproject,
        project_id,
        // TODO: add account_id
      },
    })
    navigate(
      `/projects/${project_id}/subprojects/${newSubproject.subproject_id}`,
    )
  }

  const deleteRow = async () => {
    await db.subprojects.delete({
      where: {
        subproject_id,
      },
    })
    navigate(`/projects/${project_id}/subprojects`)
  }

  const row: Subproject = results

  console.log('subproject, row:', row)

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.subprojects.update({
        where: { subproject_id },
        data: { [name]: value },
      })
    },
    [db.subprojects, subproject_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <div className="controls">
        <Button
          size="large"
          icon={<FaPlus />}
          onClick={addRow}
          title="Add new subproject" // TODO: use subproject_name_singular
        />
        <Button
          size="large"
          icon={<FaMinus />}
          onClick={deleteRow}
          title="Delete subproject" // TODO: use subproject_name_singular
        />
      </div>
      <TextFieldInactive
        label="Project"
        name="project_id"
        value={row.project_id ?? ''}
      />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Since year"
        name="since_year"
        value={row.since_year ?? ''}
        type="number"
        onChange={onChange}
      />
      <Switch
        label="Enable uploading files to subprojects"
        name="files_active"
        checked={row.files_active ?? false}
        onChange={onChange}
      />
    </div>
  )
}
