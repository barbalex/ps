import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type CheckValues from '../../models/public/CheckValues.ts'
import type Units from '../../models/public/Units.ts'

import '../../form.css'

export const CheckValue = ({ from }) => {
  const { checkValueId, projectId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM check_values WHERE check_value_id = $1`,
    [checkValueId],
  )
  const row: CheckValues | undefined = res?.rows?.[0]

  const unitsRes = useLiveQuery(
    `SELECT unit_id, name, type FROM units WHERE project_id = $1 ORDER BY sort, name`,
    [projectId],
  )
  const units: Pick<Units, 'unit_id' | 'name' | 'type'>[] = unitsRes?.rows ?? []
  const unitIds = units.map((u) => u.unit_id)
  const unitLabelMap = Object.fromEntries(
    units.map((u) => [u.unit_id, u.name ?? u.unit_id]),
  )
  const selectedUnit = units.find((u) => u.unit_id === row?.unit_id)

  // console.log('CheckValue', { row, results })

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE check_values SET ${name} = $1 WHERE check_value_id = $2`,
        [value, checkValueId],
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
      table: 'check_values',
      rowIdName: 'check_value_id',
      rowId: checkValueId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} />
      <div className="form-container">
        {!res ? (
          <Loading />
        ) : row ? (
          <>
            <RadioGroupField
              label={formatMessage({ id: 'bDkNqO', defaultMessage: 'Einheit' })}
              name="unit_id"
              list={unitIds}
              labelMap={unitLabelMap}
              isLoading={unitsRes === undefined}
              value={row.unit_id ?? ''}
              onChange={onChange}
              layout="horizontal"
              autoFocus
              ref={autoFocusRef}
              validationState={
                selectedUnit && !selectedUnit.type
                  ? 'warning'
                  : (validations?.unit_id?.state ?? 'none')
              }
              validationMessage={
                selectedUnit && !selectedUnit.type
                  ? formatMessage({
                      id: 'uN4VwX',
                      defaultMessage:
                        'Mengen-Feld wird nicht angezeigt, weil die gewählte Einheit keinen Typ hat.',
                    })
                  : validations?.unit_id?.message
              }
            />
            {(selectedUnit?.type === 'integer' ||
              row.value_integer !== null) && (
              <TextField
                label={
                  selectedUnit?.type !== 'integer'
                    ? `${formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })} (integer)`
                    : formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })
                }
                name="value_integer"
                type="number"
                value={row.value_integer ?? ''}
                onChange={onChange}
                validationState={validations?.value_integer?.state}
                validationMessage={validations?.value_integer?.message}
              />
            )}
            {(selectedUnit?.type === 'numeric' ||
              row.value_numeric !== null) && (
              <TextField
                label={
                  selectedUnit?.type !== 'numeric'
                    ? `${formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })} (numeric)`
                    : formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })
                }
                name="value_numeric"
                type="number"
                value={row.value_numeric ?? ''}
                onChange={onChange}
                validationState={validations?.value_numeric?.state}
                validationMessage={validations?.value_numeric?.message}
              />
            )}
            {(selectedUnit?.type === 'text' || row.value_text !== null) && (
              <TextField
                label={
                  selectedUnit?.type !== 'text'
                    ? `${formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })} (text)`
                    : formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })
                }
                name="value_text"
                value={row.value_text ?? ''}
                onChange={onChange}
                validationState={validations?.value_text?.state}
                validationMessage={validations?.value_text?.message}
              />
            )}
          </>
        ) : (
          <NotFound table="Check Value" id={checkValueId} />
        )}
      </div>
    </div>
  )
}
