import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { CheckValues as CheckValue } from '../../../generated/client'
import { createCheckValue } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { DropdownField } from '../../components/shared/DropdownField'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { FormHeader } from '../../components/FormHeader'

import '../form.css'

export const Component = () => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    check_id,
    check_value_id,
  } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.check_values.liveUnique({ where: { check_value_id } }),
  )

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/checks/${check_id}/values`,
    [check_id, place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const checkValue = createCheckValue()
    await db.check_values.create({
      data: {
        ...checkValue,
        check_id,
      },
    })
    navigate(`${baseUrl}/${checkValue.check_value_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, check_id, db.check_values, navigate])

  const deleteRow = useCallback(async () => {
    await db.check_values.delete({
      where: {
        check_value_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, check_value_id, db.check_values, navigate])

  const toNext = useCallback(async () => {
    const checkValues = await db.check_values.findMany({
      where: { deleted: false, check_id },
      orderBy: { label: 'asc' },
    })
    const len = checkValues.length
    const index = checkValues.findIndex(
      (p) => p.check_value_id === check_value_id,
    )
    const next = checkValues[(index + 1) % len]
    navigate(`${baseUrl}/${next.check_value_id}`)
  }, [baseUrl, check_id, check_value_id, db.check_values, navigate])

  const toPrevious = useCallback(async () => {
    const checkValues = await db.check_values.findMany({
      where: { deleted: false, check_id },
      orderBy: { label: 'asc' },
    })
    const len = checkValues.length
    const index = checkValues.findIndex(
      (p) => p.check_value_id === check_value_id,
    )
    const previous = checkValues[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.check_value_id}`)
  }, [baseUrl, check_id, check_value_id, db.check_values, navigate])

  const row: CheckValue = results

  const unitWhere = useMemo(() => ({ use_for_check_values: true }), [])

  // console.log('CheckValue', { row, results })

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.check_values.update({
        where: { check_value_id },
        data: {
          [name]:
            isNaN(value) && ['value_integer', 'value_numeric'].includes(name)
              ? null
              : value,
        },
      })
    },
    [db.check_values, check_value_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <FormHeader
        title="Check value"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="check value"
      />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="check_value_id"
          value={row.check_value_id ?? ''}
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
    </div>
  )
}
