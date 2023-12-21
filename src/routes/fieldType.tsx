import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaPlus, FaMinus } from 'react-icons/fa'
import {
  Button,
} from '@fluentui/react-components'

import { FieldTypes as FieldType } from '../../../generated/client'
import { fieldType as fieldTypePreset } from '../modules/dataPresets'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'

import '../form.css'

export const Component = () => {
  const { field_type_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.field_types.liveUnique({ where: { field_type_id } }),
    [field_type_id],
  )

  const addRow = async () => {
    const newFieldType = fieldTypePreset()
    await db.field_types.create({
      data: newFieldType,
    })
    navigate(`/field-types/${newFieldType.field_type_id}`)
  }

  const deleteRow = async () => {
    await db.field_types.delete({
      where: {
        field_type_id,
      },
    })
    navigate(`/field-types`)
  }

  const row: FieldType = results

  const onChange = useCallback(
    (e, data) => {
      const targetType = e.target.type
      const value =
        targetType === 'checkbox'
          ? data.checked
          : targetType === 'number'
          ? e.target.valueAsNumber ?? null
          : e.target.value ?? null
      const name = e.target.name
      // console.log('onChange', {
      //   name,
      //   targetType,
      //   value,
      // })
      db.projects.update({
        where: { field_type_id },
        data: { [name]: value },
      })
    },
    [db.projects, field_type_id],
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
          title="Add new field type"
        />
        <Button
          size="large"
          icon={<FaMinus />}
          onClick={deleteRow}
          title="Delete field type"
        />
      </div>
      <TextFieldInactive
        label="ID"
        name="field_type_id"
        value={row.field_type_id}
      />
      <TextField
        label="Name"
        name="name"
        value={row.name ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Sort value"
        name="sort"
        value={row.sort ?? ''}
        onChange={onChange}
      />
      <TextField
        label="Comment"
        name="comment"
        value={row.comment ?? ''}
        onChange={onChange}
      />
    </div>
  )
}
