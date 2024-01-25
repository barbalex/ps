import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ListValues as ListValue } from '../../../generated/client'
import { createListValue } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { SwitchField } from '../components/shared/SwitchField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const { project_id, list_id, list_value_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.list_values.liveUnique({ where: { list_value_id } }),
  )

  const baseUrl = `/projects/${project_id}/lists/${list_id}/values`

  const addRow = useCallback(async () => {
    const listValue = createListValue()
    await db.list_values.create({
      data: { ...listValue, list_id },
    })
    navigate(`${baseUrl}/${listValue.list_value_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, db.list_values, list_id, navigate])

  const deleteRow = useCallback(async () => {
    await db.list_values.delete({
      where: {
        list_value_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, db.list_values, list_value_id, navigate])

  const toNext = useCallback(async () => {
    const listValues = await db.list_values.findMany({
      where: { deleted: false, list_id },
      orderBy: { label: 'asc' },
    })
    const len = listValues.length
    const index = listValues.findIndex((p) => p.list_value_id === list_value_id)
    const next = listValues[(index + 1) % len]
    navigate(`${baseUrl}/${next.list_value_id}`)
  }, [baseUrl, db.list_values, list_id, list_value_id, navigate])

  const toPrevious = useCallback(async () => {
    const listValues = await db.list_values.findMany({
      where: { deleted: false, list_id },
      orderBy: { label: 'asc' },
    })
    const len = listValues.length
    const index = listValues.findIndex((p) => p.list_value_id === list_value_id)
    const previous = listValues[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.list_value_id}`)
  }, [baseUrl, db.list_values, list_id, list_value_id, navigate])

  const row: ListValue = results

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.list_values.update({
        where: { list_value_id },
        data: { [name]: value },
      })
    },
    [db.list_values, list_value_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <FormHeader
        title="List Value"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="list value"
      />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="list_value_id"
          value={row.list_value_id}
        />
        <TextField
          label="Value"
          name="value"
          value={row.value ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <SwitchField
          label="Obsolete"
          name="obsolete"
          value={row.obsolete}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
