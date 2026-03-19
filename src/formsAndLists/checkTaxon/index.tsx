import { useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type CheckTaxa from '../../models/public/CheckTaxa.ts'
import type Units from '../../models/public/Units.ts'

import '../../form.css'

export const CheckTaxon = ({ from }) => {
  const { checkTaxonId, projectId } = useParams({ from })
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})
  const { formatMessage } = useIntl()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()
  const res = useLiveQuery(
    `WITH ct AS (
      SELECT * FROM check_taxa WHERE check_taxon_id = $1
    ), u AS (
      SELECT json_agg(json_build_object('unit_id', unit_id, 'name', name, 'type', type) ORDER BY sort, name) AS units_data
      FROM units WHERE project_id = $2
    )
    SELECT ct.*, u.units_data FROM ct, u`,
    [checkTaxonId, projectId],
  )
  const rawRow = res?.rows?.[0] as
    | (CheckTaxa & {
        units_data: Pick<Units, 'unit_id' | 'name' | 'type'>[] | null
      })
    | undefined
  const row: CheckTaxa | undefined = rawRow
  const units: Pick<Units, 'unit_id' | 'name' | 'type'>[] =
    rawRow?.units_data ?? []
  const unitIds = units.map((u) => u.unit_id)
  const unitLabelMap = Object.fromEntries(
    units.map((u) => [u.unit_id, u.name ?? u.unit_id]),
  )
  const selectedUnit = units.find((u) => u.unit_id === row?.unit_id)

  // console.log('CheckTaxon', { row, results })

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE check_taxa SET ${name} = $1 WHERE check_taxon_id = $2`,
        [value, checkTaxonId],
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
      table: 'check_taxa',
      rowIdName: 'check_taxon_id',
      rowId: checkTaxonId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        {!res ? (
          <Loading />
        ) : row ? (
          <>
            <DropdownField
              label={formatMessage({ id: 'OSk4zO', defaultMessage: 'Taxon' })}
              name="taxon_id"
              table="taxa"
              value={row.taxon_id ?? ''}
              onChange={onChange}
              autoFocus
              ref={autoFocusRef}
              validationState={validations?.taxon_id?.state}
              validationMessage={validations?.taxon_id?.message}
            />
            <RadioGroupField
              label={formatMessage({ id: 'bDkNqO', defaultMessage: 'Einheit' })}
              name="unit_id"
              list={unitIds}
              labelMap={unitLabelMap}
              isLoading={res === undefined}
              value={row.unit_id ?? ''}
              onChange={onChange}
              layout="horizontal"
              validationState={validations?.unit_id?.state}
              validationMessage={validations?.unit_id?.message}
            />
            {selectedUnit?.type === 'integer' && (
              <TextField
                label={formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })}
                name="value_integer"
                type="number"
                value={row.value_integer ?? ''}
                onChange={onChange}
                validationState={validations?.value_integer?.state}
                validationMessage={validations?.value_integer?.message}
              />
            )}
            {selectedUnit?.type === 'numeric' && (
              <TextField
                label={formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })}
                name="value_numeric"
                type="number"
                value={row.value_numeric ?? ''}
                onChange={onChange}
                validationState={validations?.value_numeric?.state}
                validationMessage={validations?.value_numeric?.message}
              />
            )}
            {selectedUnit?.type === 'text' && (
              <TextField
                label={formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })}
                name="value_text"
                value={row.value_text ?? ''}
                onChange={onChange}
                validationState={validations?.value_text?.state}
                validationMessage={validations?.value_text?.message}
              />
            )}
          </>
        ) : (
          <NotFound
            table={formatMessage({
              id: '1kFtKf',
              defaultMessage: 'Kontroll-Taxon',
            })}
            id={checkTaxonId}
          />
        )}
      </div>
    </div>
  )
}
