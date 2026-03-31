import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type ListValues from '../../models/public/ListValues.ts'
import type Lists from '../../models/public/Lists.ts'

import '../../form.css'

const from = '/data/projects/$projectId_/lists/$listId_/values/$listValueId/'

export const ListValue = () => {
  const { listId, listValueId } = useParams({ from })
  const autoFocusRef = useRef<HTMLInputElement>(null)
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `SELECT * FROM list_values WHERE list_value_id = $1`,
    [listValueId],
  )
  const listRes = useLiveQuery(
    `SELECT value_type FROM lists WHERE list_id = $1`,
    [listId],
  )
  const row: ListValues | undefined = res?.rows?.[0]
  const listValueType: Lists['value_type'] | undefined =
    listRes?.rows?.[0]?.value_type

  const formatDateForInput = (value: unknown) => {
    if (!value) return ''
    const dateValue = value instanceof Date ? value : new Date(String(value))
    if (Number.isNaN(dateValue.getTime())) return ''
    return dateValue.toISOString().slice(0, 10)
  }

  const formatDateTimeForInput = (value: unknown) => {
    if (!value) return ''
    const dateValue = value instanceof Date ? value : new Date(String(value))
    if (Number.isNaN(dateValue.getTime())) return ''
    return dateValue.toISOString().slice(0, 16)
  }

  const onChange = async (e, data) => {
    const { name, value: valueRaw } = getValueFromChange(e, data)
    const value =
      (name === 'value_date' || name === 'value_datetime') && valueRaw === ''
        ? null
        : valueRaw
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE list_values SET ${name} = $1 WHERE list_value_id = $2`,
        [value, listValueId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'list_values',
      rowIdName: 'list_value_id',
      rowId: listValueId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const valueField = (() => {
    if (!row) return null

    switch (listValueType) {
      case 'integer':
        return {
          name: 'value_integer',
          type: 'number',
          value: row.value_integer ?? '',
        }
      case 'numeric':
        return {
          name: 'value_numeric',
          type: 'number',
          value: row.value_numeric ?? '',
        }
      case 'text':
        return {
          name: 'value_text',
          type: 'text',
          value: row.value_text ?? '',
        }
      case 'date':
        return {
          name: 'value_date',
          type: 'date',
          value: formatDateForInput(row.value_date),
        }
      case 'datetime':
        return {
          name: 'value_datetime',
          type: 'datetime-local',
          value: formatDateTimeForInput(row.value_datetime),
        }
      default:
        return null
    }
  })()

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        {!res || !listRes ? (
          <Loading />
        ) : !row ? (
          <NotFound
            table={formatMessage({
              id: 'QMOyrE',
              defaultMessage: 'Listen-Wert',
            })}
            id={listValueId}
          />
        ) : (
          <>
            {!!valueField && (
              <TextField
                label={formatMessage({ id: 'ejuFAr', defaultMessage: 'Wert' })}
                name={valueField.name}
                type={valueField.type}
                value={valueField.value}
                onChange={onChange}
                autoFocus
                ref={autoFocusRef}
                validationState={validations?.[valueField.name]?.state}
                validationMessage={validations?.[valueField.name]?.message}
              />
            )}
            {!valueField && (
              <div>
                {formatMessage({
                  id: 'uA2LpQ',
                  defaultMessage:
                    'Kein Wert-Typ gesetzt. Bitte in der Liste einen Wert-Typ wählen.',
                })}
              </div>
            )}
            <SwitchField
              label={formatMessage({ id: 'Ob2kQz', defaultMessage: 'Obsolet' })}
              name="obsolete"
              value={row.obsolete}
              onChange={onChange}
              validationState={validations?.obsolete?.state}
              validationMessage={validations?.obsolete?.message}
            />
          </>
        )}
      </div>
    </div>
  )
}
