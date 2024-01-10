import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { FieldTypes as FieldType } from '../../../generated/client'
import { createFieldType } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormMenu } from '../components/FormMenu'

import '../form.css'

export const Component = () => {
  const { field_type_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.field_types.liveUnique({ where: { field_type_id } }),
    [field_type_id],
  )

  const addRow = useCallback(async () => {
    const data = createFieldType()
    await db.field_types.create({ data })
    navigate(`/field-types/${data.field_type_id}`)
    autoFocusRef.current?.focus()
  }, [db.field_types, navigate])

  const deleteRow = useCallback(async () => {
    await db.field_types.delete({
      where: { field_type_id },
    })
    navigate(`/field-types`)
  }, [db.field_types, field_type_id, navigate])

  const toNext = useCallback(async () => {
    const fieldTypes = await db.field_types.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = fieldTypes.length
    const index = fieldTypes.findIndex((p) => p.field_type_id === field_type_id)
    const next = fieldTypes[(index + 1) % len]
    navigate(`/field-types/${next.field_type_id}`)
  }, [db.field_types, field_type_id, navigate])

  const toPrevious = useCallback(async () => {
    const fieldTypes = await db.field_types.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = fieldTypes.length
    const index = fieldTypes.findIndex((p) => p.field_type_id === field_type_id)
    const previous = fieldTypes[(index + len - 1) % len]
    navigate(`/field-types/${previous.field_type_id}`)
  }, [db.field_types, field_type_id, navigate])

  const row: FieldType = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.field_types.update({
        where: { field_type_id },
        data: { [name]: value },
      })
    },
    [db.field_types, field_type_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-container">
      <FormMenu
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="field type"
      />
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
        autoFocus
        ref={autoFocusRef}
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
