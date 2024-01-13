import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { ActionValues as ActionValue } from '../../../generated/client'
import { createActionValue } from '../modules/createRows'
import { useElectric } from '../ElectricProvider'
import { TextField } from '../components/shared/TextField'
import { TextFieldInactive } from '../components/shared/TextFieldInactive'
import { DropdownField } from '../components/shared/DropdownField'
import { getValueFromChange } from '../modules/getValueFromChange'
import { FormHeader } from '../components/FormHeader'

import '../form.css'

export const Component = () => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    action_id,
    action_value_id,
  } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    () => db.action_values.liveUnique({ where: { action_value_id } }),
    [action_value_id],
  )

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/actions/${action_id}/values`,
    [action_id, place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const actionValue = createActionValue()
    await db.action_values.create({
      data: {
        ...actionValue,
        action_id,
      },
    })
    navigate(`${baseUrl}/${actionValue.action_value_id}`)
    autoFocusRef.current?.focus()
  }, [action_id, baseUrl, db.action_values, navigate])

  const deleteRow = useCallback(async () => {
    await db.action_values.delete({
      where: {
        action_value_id,
      },
    })
    navigate(baseUrl)
  }, [action_value_id, baseUrl, db.action_values, navigate])

  const toNext = useCallback(async () => {
    const actionValues = await db.action_values.findMany({
      where: { deleted: false, action_id },
      orderBy: { label: 'asc' },
    })
    const len = actionValues.length
    const index = actionValues.findIndex(
      (p) => p.action_value_id === action_value_id,
    )
    const next = actionValues[(index + 1) % len]
    navigate(`${baseUrl}/${next.action_value_id}`)
  }, [action_id, action_value_id, baseUrl, db.action_values, navigate])

  const toPrevious = useCallback(async () => {
    const actionValues = await db.action_values.findMany({
      where: { deleted: false, action_id },
      orderBy: { label: 'asc' },
    })
    const len = actionValues.length
    const index = actionValues.findIndex(
      (p) => p.action_value_id === action_value_id,
    )
    const previous = actionValues[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.action_value_id}`)
  }, [action_id, action_value_id, baseUrl, db.action_values, navigate])

  const row: ActionValue = results

  const unitWhere = useMemo(() => ({ use_for_action_values: true }), [])

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.action_values.update({
        where: { action_value_id },
        data: {
          [name]:
            isNaN(value) && ['value_integer', 'value_numeric'].includes(name)
              ? null
              : value,
        },
      })
    },
    [db.action_values, action_value_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <>
      <FormHeader
        title="Action Value"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="action value"
      />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="action_value_id"
          value={row.action_value_id ?? ''}
        />
        <DropdownField
          label="Unit"
          name="unit_id"
          table="units"
          where={unitWhere}
          value={row.unit_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="Value (integer)"
          name="value_integer"
          type="number"
          value={row.value_integer ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Value (numeric)"
          name="value_numeric"
          type="number"
          value={row.value_numeric ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Value (text)"
          name="value_text"
          value={row.value_text ?? ''}
          onChange={onChange}
        />
      </div>
    </>
  )
}
